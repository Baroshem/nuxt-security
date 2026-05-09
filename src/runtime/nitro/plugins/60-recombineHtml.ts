import { defineNitroPlugin } from 'nitropack/runtime'
import { resolveSecurityRules } from '../context'
import { headerStringFromObject } from '../../../utils/headers'

const META_CSP_RE = /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/i
const HEAD_CHARSET_RE = /<meta\s+charset=["'][^"']*["'][^>]*>/i
const HEAD_OPEN_RE = /<head\b[^>]*>/i

/**
 * This plugin adds the Content-Security-Policy header to the HTML meta tag in SSG mode.
 *
 * Runs in `render:response` so that it operates on the finalized HTML string, after
 * hashes have been computed (30-cspSsgHashes) and injected into the CSP directive
 * (50-updateCsp). This ensures the CSP meta tag reflects the final served HTML
 * regardless of the order of other `render:html` listeners.
 */
export default defineNitroPlugin((nitroApp) => {
  if (!import.meta.prerender) {
    return
  }

  nitroApp.hooks.hook('render:response', (response, { event }) => {
    // Exit if no need to parse HTML for this route
    const rules = resolveSecurityRules(event)
    if (!rules.enabled) {
      return
    }

    if (rules.ssg && rules.ssg.meta && rules.headers && rules.headers.contentSecurityPolicy) {
      const body = response.body
      if (typeof body !== 'string' || !body) {
        return
      }

      const csp = structuredClone(rules.headers.contentSecurityPolicy)
      csp['frame-ancestors'] = false
      const headerValue = headerStringFromObject('contentSecurityPolicy', csp)
      const metaTag = `<meta http-equiv="Content-Security-Policy" content="${headerValue}">`

      // If a previous run already inserted a CSP meta tag, replace it so hashes stay fresh.
      if (META_CSP_RE.test(body)) {
        response.body = body.replace(META_CSP_RE, metaTag)
        return
      }

      // Insert just after the charset meta tag when available, otherwise right after <head>.
      const charsetMatch = HEAD_CHARSET_RE.exec(body)
      if (charsetMatch) {
        const insertAt = charsetMatch.index + charsetMatch[0].length
        response.body = body.slice(0, insertAt) + metaTag + body.slice(insertAt)
        return
      }

      const headMatch = HEAD_OPEN_RE.exec(body)
      if (headMatch) {
        const insertAt = headMatch.index + headMatch[0].length
        response.body = body.slice(0, insertAt) + metaTag + body.slice(insertAt)
      }
    }
  })
})
