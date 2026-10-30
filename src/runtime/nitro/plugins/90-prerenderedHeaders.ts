import { defineNitroPlugin, onPageResponse, onResponse, useStorage } from '#nuxt-security/server'
import { resolveSecurityRules } from '../context'

/**
 * This plugin saves and retrieves prerendered headers in SSG mode.
 */
export default defineNitroPlugin(async(nitroApp) => {
  // Save prerendered headers when in SSG mode
  if (import.meta.prerender) {
    const prerenderedHeaders: Record<string, Record<string, string>> = {}
    let saving = Promise.resolve()
    // Payloads are rendered at the path of their page, without render:html
    const pages = new WeakSet<object>()
    nitroApp.hooks.hook('render:html', (_, { event }) => {
      pages.add(event.context)
    })
    // Saved as each page is sent, after 70-securityHeaders: the Nitro v3 prerenderer never calls `close`
    onPageResponse(nitroApp, async(event, headers) => {
      const rules = resolveSecurityRules(event)
      const path = event.path.split('?')[0]
      if (path && pages.has(event.context) && rules.enabled && rules.ssg && rules.ssg.nitroHeaders) {
        // We eliminate the x-nitro-prerender header
        prerenderedHeaders[path] = Object.fromEntries([...headers.entries()].filter(([header]) => header !== 'x-nitro-prerender'))
        // Pages render concurrently, so the writes go one after the other
        saving = saving.then(() => useStorage('build:nuxt-security').setItem('headers.json', prerenderedHeaders))
        await saving
      }
    })
  }

  // Retrieve prerendered headers when in SSR mode
  else {
    const prerenderedHeaders = await useStorage('assets:nuxt-security').getItem<Record<string, Record<string, string>>>('headers.json') || {}
    onResponse(nitroApp, (event, headers) => {
      const rules = resolveSecurityRules(event)
      if (rules.enabled && rules.ssg && rules.ssg.nitroHeaders) {
        const path = event.path.split('?')[0]
        // We retrieve the headers for the current path
        if (path && prerenderedHeaders[path]) {
          for (const [header, value] of Object.entries(prerenderedHeaders[path])) {
            headers.set(header, value)
          }
        }
      }
    })
  }
})
