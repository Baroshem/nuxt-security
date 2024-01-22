import { defineNitroPlugin, getRouteRules } from '#imports'
import * as cheerio from 'cheerio'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, { event }) => {

    // Exit if no need to parse HTML for this route
    const { security } = getRouteRules(event)
    if (!security?.sri && (!security?.headers || !security?.headers.contentSecurityPolicy)) {
      return
    }

    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = {} as Record<Section, ReturnType<typeof cheerio.load>[]>
    for (const section of sections) {
      cheerios[section] = html[section].map(element => {
        return cheerio.load(element, null, false)
      })
    }
    event.context.cheerios = cheerios
  })
})