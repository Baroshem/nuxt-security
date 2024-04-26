import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../utils'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit in SSG mode
    if (import.meta.prerender) {
      return
    }

    // Exit if no CSP defined
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.headers || !rules.headers.contentSecurityPolicy || !rules.nonce) {
      return
    }


    const nonce = event.context.security.nonce!
    // Scan all relevant sections of the NuxtRenderHtmlContext
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = event.context.security.cheerios!
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
  })
})
