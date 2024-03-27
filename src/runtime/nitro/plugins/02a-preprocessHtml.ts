import { defineNitroPlugin, getRouteRules } from '#imports'
import * as cheerio from 'cheerio/lib/slim'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, { event }) => {

    // Exit if no need to parse HTML for this route
    const { security } = getRouteRules(event)
    if (!security?.sri && (!security?.headers || !security?.headers.contentSecurityPolicy)) {
      return
    }
    event.context.cheerios = html
    event.context.cache = { 
      scripts: new Map(),
      links: new Map(),
    }
  })
})
