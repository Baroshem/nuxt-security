import path from 'node:path'
import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import defu from 'defu'
import type {
  ContentSecurityPolicyValue
} from '../../../types/headers'
import { defineNitroPlugin, useRuntimeConfig, getRouteRules } from '#imports'
import { useNitro } from '@nuxt/kit'
import * as cheerio from 'cheerio'

const moduleOptions = useRuntimeConfig().security

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Content Security Policy

    if (!isContentSecurityPolicyEnabled(event)) {
      return
    }

    if (!moduleOptions.headers) {
      return
    }

    const scriptHashes: Set<string> = new Set()
    const styleHashes: Set<string> = new Set()
    const hashAlgorithm = 'sha256'

    // Scan all relevant sections of the NuxtRenderHtmlContext
    for (const section of ['body', 'bodyAppend', 'bodyPrepend', 'head']) {
      const htmlRecords = html as unknown as Record<string, string[]>
      const elements = htmlRecords[section]
      for (const element of elements) {
        const $ = cheerio.load(element, null, false)

        // Parse all script tags
        $('script').each((i, script) => {
          const scriptText = $(script).text()
          const scriptAttrs = $(script).attr()
          const src = scriptAttrs?.src
          const integrity = scriptAttrs?.integrity
          if (!src && scriptText) {
            // Hash inline scripts with content
            scriptHashes.add(generateHash(scriptText, hashAlgorithm))
          } else if (src && integrity) {
            // Whitelist external scripts with integrity
            scriptHashes.add(`'${integrity}'`)
          }
        })

        // Parse all style tags
        $('style').each((i, style) => {
          const styleText = $(style).text()
          if (styleText) {
            // Hash inline styles with content
            styleHashes.add(generateHash(styleText, hashAlgorithm))
          }
        })

        // Parse all link tags
        $('link').each((i, link) => {
          const linkAttrs = $(link).attr()
          const integrity = linkAttrs?.integrity
          // Whitelist links to external resources with integrity
          if (integrity) {
            const rel = linkAttrs?.rel
            // HTML standard defines only 3 rel values for valid integrity attributes on links : stylesheet, preload and modulepreload
            // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-integrity
            if (rel === 'stylesheet') {
              // style: add to style-src
              styleHashes.add(`'${integrity}'`)
            } else if (rel === 'preload') {
              // Fetch standard defines the destination (https://fetch.spec.whatwg.org/#destination-table)
              // This table is the official mapping between HTML and CSP
              // We only support script-src for now, but we could populate other policies in the future
              const as = linkAttrs.as
              switch (as) {
                case 'script':
                case 'audioworklet':
                case 'paintworklet':
                case 'xlst':
                  scriptHashes.add(`'${integrity}'`)
                  break
                default:
                  break
              }
            } else if (rel === 'modulepreload') {
              // script is the default and only possible destination
              scriptHashes.add(`'${integrity}'`)
            }
          }
        })
      }
    }

    const cspConfig = moduleOptions.headers.contentSecurityPolicy

    if (cspConfig && typeof cspConfig !== 'string') {
      const content = generateCspMetaTag(cspConfig, scriptHashes, styleHashes)
      // Insert hashes in the http meta tag
      html.head.push(`<meta http-equiv="Content-Security-Policy" content="${content}">`)
      // Also insert hashes in static headers for presets that generate headers rules for static files
      updateRouteRules(event, content)
    }

  })

  // Insert hashes in the CSP meta tag for both the script-src and the style-src policies
  function generateCspMetaTag (policies: ContentSecurityPolicyValue, scriptHashes: Set<string>, styleHashes: Set<string>) {
    const unsupportedPolicies:Record<string, boolean> = {
      'frame-ancestors': true,
      'report-uri': true,
      sandbox: true
    }

    const tagPolicies = defu(policies) as ContentSecurityPolicyValue
    if (scriptHashes.size > 0 && moduleOptions.ssg?.hashScripts) {
      // Remove '""'
      tagPolicies['script-src'] = (tagPolicies['script-src'] ?? []).concat(...scriptHashes)
    }
    if (styleHashes.size > 0 && moduleOptions.ssg?.hashStyles) {
      // Remove '""'
      tagPolicies['style-src'] = (tagPolicies['style-src'] ?? []).concat(...styleHashes)
    }

    const contentArray: string[] = []
    for (const [key, value] of Object.entries(tagPolicies)) {
      if (unsupportedPolicies[key]) {
        continue
      }

      let policyValue: string

      if (Array.isArray(value)) {
        policyValue = value.join(' ')
      } else if (typeof value === 'boolean') {
        policyValue = ''
      } else {
        policyValue = value
      }

      if (value !== false) {
        contentArray.push(`${key} ${policyValue}`)
      }
    }
    const content = contentArray.join('; ').replaceAll("'nonce-{{nonce}}'", '')
    return content
  }

  // In some Nitro presets (e.g. Vercel), the header rules are generated for the static server
  // By default we update the nitro route rules with their calculated CSP value to support this possibility
  function updateRouteRules(event: H3Event, content: string) {
    const path = event.path
    const routeRules = getRouteRules(event)
    let headers
    if (routeRules.headers) {
      headers = { ...routeRules.headers }
    } else {
      headers = {}
    }
    headers['Content-Security-Policy'] = content
    routeRules.headers = headers
    const nitro = useNitro()
    nitro.options.routeRules[path] = routeRules
  }

  function generateHash (content: string, hashAlgorithm: string) {
    const hash = crypto.createHash(hashAlgorithm)
    hash.update(content)
    return `'${hashAlgorithm}-${hash.digest('base64')}'`
  }

  /**
   * Only enable behavior if Content Security pPolicy is enabled,
   * initial page is prerendered and generated file type is HTML.
   * @param event H3Event
   * @param options ModuleOptions
   * @returns boolean
   */
  function isContentSecurityPolicyEnabled (event: H3Event): boolean {
    const nitroPrerenderHeader = 'x-nitro-prerender'
    const nitroPrerenderHeaderValue = event.node.req.headers[nitroPrerenderHeader]

    // Page is not prerendered
    if (!nitroPrerenderHeaderValue) {
      return false
    }

    // File is not HTML
    if (!['', '.html'].includes(path.extname(nitroPrerenderHeaderValue as string))) {
      return false
    }

    return true
  }
})
