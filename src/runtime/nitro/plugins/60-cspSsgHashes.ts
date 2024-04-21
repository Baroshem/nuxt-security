import { defineNitroPlugin, setResponseHeader } from '#imports'
import * as cheerio from 'cheerio'
import type { ContentSecurityPolicyValue } from '~/src/module'
import { headerStringFromObject } from '../../utils/headers'
import { generateHash } from '../../utils/hashes'
//import { isPrerendering } from '../utils'
import { resolveSecurityRules } from '../utils'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit in SSR mode
    if (!import.meta.prerender) {
      return
    }

    // Exit if no CSP defined
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.headers || !rules.headers.contentSecurityPolicy) {
      return
    }

    const scriptHashes: Set<string> = new Set()
    const styleHashes: Set<string> = new Set()
    const hashAlgorithm = 'sha256'
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const cheerios = event.context.security.cheerios!

    // Parse HTML if SSG is enabled for this route
    if (rules.ssg) {
      const { hashScripts, hashStyles } = rules.ssg

      // Scan all relevant sections of the NuxtRenderHtmlContext
      const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
      for (const section of sections) {
        cheerios[section].forEach($ => {
          // Parse all script tags
          if (hashScripts) {
            $('script').each((i, script) => {
              const scriptText = $(script).text()
              const scriptAttrs = $(script).attr()
              const src = scriptAttrs?.src
              const integrity = scriptAttrs?.integrity
              if (!src && scriptText) {
                // Hash inline scripts with content
                scriptHashes.add(`'${generateHash(scriptText, hashAlgorithm)}'`)
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
                styleHashes.add(`'${generateHash(styleText, hashAlgorithm)}'`)
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
    }

    // Generate CSP rules
    const csp = rules.headers.contentSecurityPolicy
    const headerValue = generateCspRules(csp, scriptHashes, styleHashes)
    // Insert CSP in the http meta tag if meta is true

    if (rules.ssg && rules.ssg.meta) {
      cheerios.head.unshift(cheerio.load(`<meta http-equiv="Content-Security-Policy" content="${headerValue}">`, null, false))
    }
    // Update rules in HTTP header
    setResponseHeader(event, 'Content-Security-Policy', headerValue)
  })

  // Insert hashes in the CSP meta tag for both the script-src and the style-src policies
  function generateCspRules(csp: ContentSecurityPolicyValue, scriptHashes: Set<string>, styleHashes: Set<string>) {
    const generatedCsp = <ContentSecurityPolicyValue>Object.fromEntries(
      Object.entries(csp)
      .map(([key, value]) => {
        // Return boolean values unchanged
        if (typeof value === 'boolean') {
          return [key, value]
        }

        // Make sure nonce placeholders are eliminated
        const sources = (typeof value === 'string') ? value.split(' ').map(token => token.trim()).filter(token => token) : value
        const modifiedSources = sources.filter(source => !source.startsWith("'nonce-"))

        const directive = <keyof ContentSecurityPolicyValue>key
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
      })
      // Remove frame-ancestors from the CSP when delivered in the meta tag
      .filter(([key]) => <keyof ContentSecurityPolicyValue>key !== 'frame-ancestors')
    )
    return headerStringFromObject('contentSecurityPolicy', generatedCsp)
  }
})
