import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../context'
import crypto from 'node:crypto'

/**
 * This plugin generates a nonce for the current request and adds it to the HTML.
 * It only runs in SSR mode.
 */
export default defineNitroPlugin((nitroApp) => {
  // Exit in SSG mode
  if (import.meta.prerender) {
    return
  }

  nitroApp.hooks.hook('request', (event) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.nonce && !import.meta.prerender) {
      const nonce = crypto.randomBytes(16).toString('base64')
      event.context.security!.nonce = nonce
    }
  })

  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit if no CSP defined
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.headers || !rules.headers.contentSecurityPolicy || !rules.nonce) {
      return
    }

    const nonce = event.context.security!.nonce!
    // Scan all relevant sections of the NuxtRenderHtmlContext
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = event.context.security!.cheerios!
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
