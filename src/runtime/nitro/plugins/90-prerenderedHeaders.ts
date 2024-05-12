import { defineNitroPlugin, getResponseHeaders, setResponseHeaders, useStorage } from '#imports'
import { resolveSecurityRules } from '../context'

/**
 * This plugin saves and retrieves prerendered headers in SSG mode.
 */
export default defineNitroPlugin(async(nitroApp) => {
  // Save prerendered headers when in SSG mode
  if (import.meta.prerender) {
    const prerenderedHeaders: Record<string, Record<string, string>> = {}
    nitroApp.hooks.hook('render:html', (_, { event }) => {
      const rules = resolveSecurityRules(event)
      if (rules.enabled && rules.ssg && rules.ssg.nitroHeaders) {
        // We save the headers for the current path
        const headers = structuredClone(getResponseHeaders(event) as Record<string, string>)
        delete headers['x-nitro-prerender']
        const path = event.path.split('?')[0]
        prerenderedHeaders[path] =  headers
      }
    })

    nitroApp.hooks.hook('close', async() => {
      await useStorage('build:nuxt-security').setItem('headers.json', prerenderedHeaders)
    })
  }

  // Retrieve prerendered headers when in SSR mode
  else {
    const prerenderedHeaders = await useStorage('assets:nuxt-security').getItem<Record<string, Record<string, string>>>('headers.json') || {}
    nitroApp.hooks.hook('beforeResponse', (event) => {
      const rules = resolveSecurityRules(event)
      if (rules.enabled && rules.ssg && rules.ssg.nitroHeaders) {
        const path = event.path.split('?')[0]
        // We retrieve the headers for the current path
        if (prerenderedHeaders[path]) {
          setResponseHeaders(event, prerenderedHeaders[path])
        }
      }
    })
  }
})