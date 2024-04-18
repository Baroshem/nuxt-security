import { defineNitroPlugin, getResponseHeaders } from '#imports'
import { tryUseNuxt, useNitro } from '@nuxt/kit'
import { defu } from 'defu'



export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (_, { event }) => {
    // Exit if Nitro not available
    if (!tryUseNuxt()) {
      return
    }
    // Exit in SSR mode
    if (!import.meta.prerender) {
      return
    }

    // In some Nitro presets (e.g. Vercel), the header rules are generated for the static server
    // By default we update the nitro headers route rules with their calculated value to support this possibility
    const headers = getResponseHeaders(event) as Record<string, string>
    const nitro = useNitro()
    nitro.options.routeRules[event.path] = defu(
      { headers },
      nitro.options.routeRules[event.path]
    )
  })
})