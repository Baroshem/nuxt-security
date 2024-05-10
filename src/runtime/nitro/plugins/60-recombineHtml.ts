import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../context'
import { headerStringFromObject } from '../../../utils/headers'

/**
 * This plugin recombines the HTML sections from the Cheerio instances in the event context.
 * It also adds the Content-Security-Policy header to the HTML meta tag in SSG mode.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit if no need to parse HTML for this route
    const rules = resolveSecurityRules(event)
    if (!rules.enabled) {
      return
    }

    if (rules.sri || (rules.headers && rules.headers.contentSecurityPolicy)) {
      // Scan all relevant sections of the NuxtRenderHtmlContext
      type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
      const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
      const cheerios = event.context.security!.cheerios!

      for (const section of sections) {
        html[section] = cheerios[section].map($ => {
          const html = $.html()
          return html
        })
      }
    }

    if (rules.ssg && rules.ssg.meta && rules.headers && rules.headers.contentSecurityPolicy && import.meta.prerender) {
      const csp = structuredClone(rules.headers.contentSecurityPolicy)
      csp['frame-ancestors'] = false
      const headerValue = headerStringFromObject('contentSecurityPolicy', csp)
      html.head.unshift(`<meta http-equiv="Content-Security-Policy" content="${headerValue}">`)
    }
  })
})