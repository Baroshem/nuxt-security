import { defineNitroPlugin } from '#imports'
import { type CheerioAPI } from 'cheerio'
//import { isPrerendering } from '../utils'
import { resolveSecurityRules } from '../utils/context'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async(html, { event }) => {
    // Exit in SSG mode
    if (import.meta.prerender) {
      return
    }

    // Exit if no CSP defined
    const rules = await resolveSecurityRules(event)
    // const { rules } = event.context.security
    if (!rules?.headers || !rules.headers.contentSecurityPolicy) {
      return
    }

    // Parse HTML if nonce is enabled for this route
    if (rules.nonce) {
      const nonce = event.context.security.nonce
      // Scan all relevant sections of the NuxtRenderHtmlContext
      type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
      const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
      const cheerios = event.context.cheerios as Record<Section, CheerioAPI[]>
      for (const section of sections) {
        cheerios[section].forEach($ => {
          // Add nonce to all link tags
          $('link').attr('nonce', nonce)
          // Add nonce to all script tags
          $('script').attr('nonce', nonce)
          // Add nonce to all style tags
          $('style').attr('nonce', nonce)
        })
      }
    }
  })
})
