import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../context'
import { generateHash } from '../../../utils/hash'

/*
FOLLOWING PATTERN NOT IN USE:
Placeholder until a proper caching strategy is though of:
/<script((?=[^>]+src="([\w:.-\/]+)")(?:(?![^>]+integrity="[\w-]+")|(?=[^>]+integrity="([\w-])"))[^>]+)(?:\/>|><\/script>)/g
Allows to obtain integrity from both scripts with integrity and those without (useful for 03)
*/

const INLINE_SCRIPT_RE = /<script(?![^>]*?\bsrc="[\w:.\-\\/]+")[^>]*>(.*?)<\/script>/g
const STYLE_RE = /<style[^>]*>(.*?)<\/style>/g
const SCRIPT_RE = /<script(?=[^>]+\bsrc="[^"]+")(?=[^>]+\bintegrity="([\w\-+/=]+)")[^>]+(?:\/>|><\/script>)/g
const LINK_RE = /<link(?=[^>]+\brel="(stylesheet|preload|modulepreload)")(?=[^>]+\bintegrity="([\w\-+/=]+)")(?=[^>]+\bas="(\w+)")[^>]+>/g



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

    // Parse HTML if SSG is enabled for this route
    if (rules.ssg) {
      const { hashScripts, hashStyles } = rules.ssg

      // Scan all relevant sections of the NuxtRenderHtmlContext
      const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
      for (const section of sections) {
        html[section] = html[section].map(element => {
          if (hashScripts) {
            // Parse all script tags
             element = element.replace(INLINE_SCRIPT_RE, (match, scriptText) => {
               scriptHashes.add(`'${generateHash(scriptText, hashAlgorithm)}'`)
               return match
             })
             element = element.replace(SCRIPT_RE, (match, integrity) => {
               scriptHashes.add(`'${integrity}'`)
               return match
             })
          }
          // Parse all style tags
          if (hashStyles) {
            element = element.replace(STYLE_RE, (match, styleText) => {
              if (styleText) {
                // Hash inline styles with content
                styleHashes.add(`'${generateHash(styleText, hashAlgorithm)}'`)
              }
              return match
            })
          }

          // Parse all link tags
          element = element.replace(LINK_RE, (match, rel, integrity, as)=>{
            // Whitelist links to external resources with integrity
            if (integrity) {
              // HTML standard defines only 3 rel values for valid integrity attributes on links : stylesheet, preload and modulepreload
              // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-integrity
              if (rel === 'stylesheet' && hashStyles) {
                // style: add to style-src
                styleHashes.add(`'${integrity}'`)
              } else if (rel === 'preload' && hashScripts) {
                // Fetch standard defines the destination (https://fetch.spec.whatwg.org/#destination-table)
                // This table is the official mapping between HTML and CSP
                // We only support script-src for now, but we could populate other policies in the future
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
            return match
          })
          return element
        })
      }
    }
  })
})