import { defineNitroPlugin, getResponseHeaders, setResponseHeaders, useStorage } from '#imports'
import { type OutgoingHttpHeaders } from 'http'

/**
 * This plugin saves and retrieves prerendered headers in SSG mode.
 */
export default defineNitroPlugin(async(nitroApp) => {
  // Save prerendered headers when in SSG mode
  if (import.meta.prerender) {
    const prerenderedHeaders: Record<string, { headers : OutgoingHttpHeaders }> = {}
    nitroApp.hooks.hook('render:html', async(_, { event }) => {
      // We save the headers for the current path
      const headers = getResponseHeaders(event)
      const path = event.path.split('?')[0]
      prerenderedHeaders[path] =  { headers }
    })

    nitroApp.hooks.hook('close', async() => {
      await useStorage('build:nuxt-security').setItem('headers.json', prerenderedHeaders)
    })
  }

  // Retrieve prerendered headers when in SSR mode
  else {
    const prerenderedHeaders = await useStorage('assets:nuxt-security').getItem<Record<string, { headers : OutgoingHttpHeaders}>>('headers.json') || {}
    nitroApp.hooks.hook('beforeResponse', async(event) => {
      const path = event.path.split('?')[0]
      // We retrieve the headers for the current path
      if (prerenderedHeaders[path]) {
        setResponseHeaders(event, prerenderedHeaders[path].headers)
      }
    })
  }
})