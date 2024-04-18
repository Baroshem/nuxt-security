import { defineNitroPlugin } from '#imports'
import { type CheerioAPI } from 'cheerio'
import { resolveSecurityRules } from '../utils'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {

    // Exit if no need to parse HTML for this route
    const rules = resolveSecurityRules(event)
    // const { rules } = event.context.security
    if (!rules?.sri && (!rules?.headers || !rules.headers.contentSecurityPolicy)) {
      return
    }

    // Scan all relevant sections of the NuxtRenderHtmlContext
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = event.context.cheerios as Record<Section, CheerioAPI[]>
    for (const section of sections) {
      html[section] = cheerios[section].map($ => {
        const html = $.html()
        return html
      })
    }
  })
})