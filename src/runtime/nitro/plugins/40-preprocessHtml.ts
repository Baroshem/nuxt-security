import { defineNitroPlugin } from '#imports'
import * as cheerio from 'cheerio/lib/slim'
import { resolveSecurityRules } from '../utils/context'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async(html, { event }) => {

    // Exit if no need to parse HTML for this route
    const rules = await resolveSecurityRules(event)
    // const { rules } = event.context.security
    if (!rules?.sri && (!rules?.headers || !rules?.headers.contentSecurityPolicy)) {
      return
    }

    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = {} as Record<Section, ReturnType<typeof cheerio.load>[]>
    for (const section of sections) {
      cheerios[section] = html[section].map(element => {
        return cheerio.load(element, {
          xml: {
            // Disable `xmlMode` to parse HTML with htmlparser2.
            xmlMode: false,
            decodeEntities: false
          },
        }, false)
      })
    }
    event.context.cheerios = cheerios
  })
})