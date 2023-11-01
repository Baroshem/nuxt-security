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

    const scriptHashes: string[] = []
    const styleHashes: string[] = []
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
            scriptHashes.push(generateHash(scriptText, hashAlgorithm))
          } else if (src && integrity) {
            // Whitelist external scripts with integrity
            scriptHashes.push(`'${integrity}'`)
          }
        })

        // Parse all style tags
        $('style').each((i, style) => {
          const styleText = $(style).text()
          if (styleText) {
            // Hash inline styles with content
            styleHashes.push(generateHash(styleText, hashAlgorithm))
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
  function generateCspMetaTag (policies: ContentSecurityPolicyValue, scriptHashes: string[], styleHashes: string[]) {
    const unsupportedPolicies:Record<string, boolean> = {
      'frame-ancestors': true,
      'report-uri': true,
      sandbox: true
    }

    const tagPolicies = defu(policies) as ContentSecurityPolicyValue
    if (scriptHashes.length > 0 && moduleOptions.ssg?.hashScripts) {
      // Remove '""'
      tagPolicies['script-src'] = (tagPolicies['script-src'] ?? []).concat(scriptHashes)
    }
    if (styleHashes.length > 0 && moduleOptions.ssg?.hashScripts) {
      // Remove '""'
      tagPolicies['style-src'] = (tagPolicies['style-src'] ?? []).concat(styleHashes)
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
