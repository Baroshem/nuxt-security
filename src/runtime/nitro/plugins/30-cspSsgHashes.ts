import { defineNitroPlugin } from '#imports'
import { generateHash } from '../utils'
import { resolveSecurityRules } from '../context'

/**
 * This plugin adds security hashes to the event context for later use in the CSP header.
 * It only runs in SSG mode
 */
export default defineNitroPlugin((nitroApp) => {
  // Exit in SSR mode
  if (!import.meta.prerender) {
    return
  }

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit if no CSP defined
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.headers || !rules.headers.contentSecurityPolicy) {
      return
    }

    event.context.security!.hashes = {
      script: new Set(),
      style: new Set()
    }
    const scriptHashes = event.context.security!.hashes.script
    const styleHashes = event.context.security!.hashes.style
    const hashAlgorithm = 'sha256'
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const cheerios = event.context.security!.cheerios!

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
  })
})