import { defineNitroPlugin, getRouteRules, setResponseHeader } from '#imports'
import * as cheerio from 'cheerio'
import type { ContentSecurityPolicyValue } from '~/src/module'
import { headerStringFromObject } from '../../utils/headers'
import { generateHash } from '../../utils/hashes'
import { isPrerendering } from '../utils'

/*
FOLLOWING PATTERN NOT IN USE:
Placeholder until a proper caching strategy is though of:
/<script((?=[^>]+src="([\w:.-\/]+)")(?:(?![^>]+integrity="[\w-]+")|(?=[^>]+integrity="([\w-])"))[^>]+)(?:\/>|><\/script>)/g
Allows to obtain integrity from both scripts with integrity and those without (useful for 03)
*/

const INLINE_SCRIPT_RE = /<script(?![^>]*?\bsrc="[\w:.\-\\/]+")[^>]*>(.*?)<\/script>/g
const STYLE_RE = /<style[^>]*>(.*?)<\/style>/g
const SCRIPT_RE = /<script(?=[^>]+\bsrc="[\w:.\-\\/]+")(?=[^>]+\bintegrity="([\w-]+)")[^>]+(?:\/>|><\/script>)/g
const LINK_RE = /<link(?=[^>]+\brel="(stylesheet|preload|modulepreload)")(?=[^>]+\bintegrity="([\w-]+)")(?=[^>]+\bas="(\w+)")[^>]+>/g

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit in SSR mode
    if (!isPrerendering(event)) {
      return
    }

    // Exit if no CSP defined
    const { security } = getRouteRules(event)
    if (!security?.headers || !security.headers.contentSecurityPolicy) {
      return
    }

    const scriptHashes: Set<string> = new Set()
    const styleHashes: Set<string> = new Set()
    const hashAlgorithm = 'sha256'
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const cheerios = event.context.cheerios as Record<Section, ReturnType<typeof cheerio.load>[]>

    // Parse HTML if SSG is enabled for this route
    if (security.ssg) {
      const { hashScripts, hashStyles } = security.ssg

      // Scan all relevant sections of the NuxtRenderHtmlContext
      const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
      for (const section of sections) {
        cheerios[section] = cheerios[section].map($=>{
          if (hashScripts) {
            // Parse all script tags
             $ = $.replace(INLINE_SCRIPT_RE,(match, scriptText)=>{
               scriptHashes.add(`'${generateHash(scriptText, hashAlgorithm)}'`)
               return match
             })
             $ = $.replace(SCRIPT_RE, (match, integrity)=>{
               scriptHashes.add(`'${integrity}'`)
               return match
             })
          }
          // Parse all style tags
          if (hashStyles) {
            $ = $.replace(STYLE_RE, (match, styleText)=>{
              if (styleText) {
                // Hash inline styles with content
                styleHashes.add(`'${generateHash(styleText, hashAlgorithm)}'`)
              }
              return match
            })
          }

          // Parse all link tags
          $ = $.replace(LINK_RE, (match, rel, integrity, as)=>{
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
          return $
        })
      }
    }

    // Generate CSP rules
    const csp = security.headers.contentSecurityPolicy
    const headerValue = generateCspRules(csp, scriptHashes, styleHashes)
    // Insert CSP in the http meta tag if meta is true

    if (security.ssg && security.ssg.meta) {
      cheerios.head.push(cheerio.load(`<meta http-equiv="Content-Security-Policy" content="${headerValue}">`, null, false))
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
