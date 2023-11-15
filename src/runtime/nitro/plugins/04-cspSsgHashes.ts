import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { defineNitroPlugin, getRouteRules, getRequestHeader } from '#imports'
import { useNitro } from '@nuxt/kit'
import * as cheerio from 'cheerio'
import type { ContentSecurityPolicyValue } from '~/src/module'
import { headerStringFromObject } from '../../utils/headers'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {

    // Exit in SSR mode
    if (!isPrerendering(event)) {
      return
    }

    // Exit if no CSP defined
    const { security } = getRouteRules(event)
    if (!security?.ssg || !security.headers || !security.headers.contentSecurityPolicy) {
      return
    }

    const scriptHashes: Set<string> = new Set()
    const styleHashes: Set<string> = new Set()
    const hashAlgorithm = 'sha256'

    // Parse HTML if SSG is enabled for this route
    const { hashScripts, hashStyles } = security.ssg

    // Scan all relevant sections of the NuxtRenderHtmlContext
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    for (const section of sections) {
      html[section].forEach(element => {
        const $ = cheerio.load(element, null, false)

        // Parse all script tags
        if (hashScripts) {
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
        }

        // Parse all style tags
        if (hashStyles) {
          $('style').each((i, style) => {
            const styleText = $(style).text()
            if (styleText) {
              // Hash inline styles with content
              styleHashes.add(generateHash(styleText, hashAlgorithm))
            }
          })
        }

        // Parse all link tags
        $('link').each((i, link) => {
          const linkAttrs = $(link).attr()
          const integrity = linkAttrs?.integrity
          // Whitelist links to external resources with integrity
          if (integrity) {
            const rel = linkAttrs?.rel
            // HTML standard defines only 3 rel values for valid integrity attributes on links : stylesheet, preload and modulepreload
            // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-integrity
            if (rel === 'stylesheet' && hashStyles) {
              // style: add to style-src
              styleHashes.add(`'${integrity}'`)
            } else if (rel === 'preload' && hashScripts) {
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
            } else if (rel === 'modulepreload' && hashScripts) {
              // script is the default and only possible destination
              scriptHashes.add(`'${integrity}'`)
            }
          }
        })
      })
    }
    // Generate CSP rules
    const csp = security.headers.contentSecurityPolicy
    const content = generateCspRules(csp, scriptHashes, styleHashes)
    // Insert CSP in the http meta tag
    html.head.push(`<meta http-equiv="Content-Security-Policy" content="${content}">`)
    // Also insert hashes in static headers for presets that generate headers rules for static files
    updateRouteRules(event, content)
    // Remove header in SSG
    event.node.res.removeHeader('Content-Security-Policy')

  })

  // Insert hashes in the CSP meta tag for both the script-src and the style-src policies
  function generateCspRules(csp: ContentSecurityPolicyValue, scriptHashes: Set<string>, styleHashes: Set<string>) {
    const generatedCsp = Object.fromEntries(Object.entries(csp).map(([key, value]) => {
      // Return boolean values unchanged
      if (typeof value === 'boolean') {
        return [key, value]
      }

      // Make sure nonce placeholders are eliminated
      const sources = (typeof value === 'string') ? value.split(' ').map(token => token.trim()).filter(token => token) : value
      const modifiedSources = sources.filter(source => !source.startsWith("'nonce-"))

      const directive = key as keyof ContentSecurityPolicyValue
      // Add hashes to script and style
      if (directive === 'script-src') {
        modifiedSources.push(...scriptHashes)
        return [directive, modifiedSources]
      } else if (directive === 'style-src') {
        modifiedSources.push(...styleHashes)
        return [directive, modifiedSources]
      } else {
        return [directive, modifiedSources]
      }
    })) as ContentSecurityPolicyValue
    return headerStringFromObject('contentSecurityPolicy', generatedCsp)
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
   * Detect if page is being pre-rendered
   * @param event H3Event
   * @returns boolean
   */
  function isPrerendering (event: H3Event) {
    return !!getRequestHeader(event, 'x-nitro-prerender')
  }
})
