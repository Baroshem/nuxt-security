import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../context'

/**
 * This plugin parses the HTML of the NuxtRenderHtmlContext and stores the Cheerio instances in the event context.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {

    // Skip if no need to parse HTML for this route
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || (!rules.sri && (!rules.headers || !rules.headers.contentSecurityPolicy))) {
      return
    }
  })
})
