import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../context'
import { headerStringFromObject } from '../../../utils/headers'

/**
 * This plugin adds the Content-Security-Policy header to the HTML meta tag in SSG mode.
 */
export default defineNitroPlugin((nitroApp) => {
  if (!import.meta.prerender) {
    return
  }

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit if no need to parse HTML for this route
    const rules = resolveSecurityRules(event)
    if (!rules.enabled) {
      return
    }

    if (rules.ssg && rules.ssg.meta && rules.headers && rules.headers.contentSecurityPolicy) {
      const csp = structuredClone(rules.headers.contentSecurityPolicy)
      csp['frame-ancestors'] = false
      const headerValue = headerStringFromObject('contentSecurityPolicy', csp)

      // Let's insert the CSP meta tag just after the first tag which should be the charset meta
      let insertIndex = 0
      if (html.head.length > 0) {
        const metaCharsetMatch = html.head[0].match(/^<meta charset="(.*?)">/mdi)
        if (metaCharsetMatch && metaCharsetMatch.indices) {
          insertIndex = metaCharsetMatch.indices[0][1]
        }
        html.head[0] = html.head[0].slice(0, insertIndex) + `<meta http-equiv="Content-Security-Policy" content="${headerValue}">` + html.head[0].slice(insertIndex) 
      }
    }
  })
})