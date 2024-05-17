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
      html.head.unshift(`<meta http-equiv="Content-Security-Policy" content="${headerValue}">`)
    }
  })
})