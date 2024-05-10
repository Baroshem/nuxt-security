import { defineNitroPlugin } from '#imports'
import * as cheerio from 'cheerio/lib/slim'
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
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = {} as Record<Section, string[]>
    for (const section of sections) {
      cheerios[section] = html[section]
    }
    event.context.security.cheerios = cheerios
    event.context.cache = { 
      scripts: new Map(),
      links: new Map(),
    }
  })
})
