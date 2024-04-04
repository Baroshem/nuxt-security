import { useStorage, defineNitroPlugin, getRouteRules } from '#imports'
import { isPrerendering } from '../utils'
import { type CheerioAPI } from 'cheerio'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    // Exit if SRI not enabled for this route
    const { security } = getRouteRules(event)
    if (!security?.sri) {
      return
    }

    // Retrieve the sriHases that we computed at build time
    //
    // - If we are in a pre-rendering step of nuxi generate
    //   Then the /integrity directory does not exist in server assets
    //   But it is still in the .nuxt build directory
    //
    // - Conversely, if we are in a standalone SSR server pre-built by nuxi build
    //   Then we don't have a .nuxt build directory anymore
    //   But we did save the /integrity directory into the server assets    
    const prerendering = isPrerendering(event)
    const storageBase = prerendering ? 'build' : 'assets'   
    const sriHashes = await useStorage(storageBase).getItem<Record<string, string>>('integrity:sriHashes.json') || {}

    
    // Scan all relevant sections of the NuxtRenderHtmlContext
    // Note: integrity can only be set on scripts and on links with rel preload, modulepreload and stylesheet
    // However the SRI standard provides that other elements may be added to that list in the future
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = event.context.cheerios as Record<Section, CheerioAPI[]>
    for (const section of sections) {
      cheerios[section].forEach($ => {
        // Add integrity to all relevant script tags
        $('script').each((i, script) => {
          const scriptAttrs = $(script).attr()
          const src = scriptAttrs?.src
          const integrity = scriptAttrs?.integrity
          // Only add integrity to external scripts that do not already have one
          if (src && !integrity) {
            // Get the integrity hash from our static database
            const hash = sriHashes[src]
            // Set the integrity hash in HTML if found
            if (hash) {
              $(script).attr('integrity', hash)
            }
          }
        })
        // Add integrity to all relevant link tags
        $('link').each((i, link) => {
          const linkAttrs = $(link).attr()
          const rel = linkAttrs?.rel
          // HTML standard defines only 3 rel values for valid integrity attributes on links : stylesheet, preload and modulepreload
          // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-integrity
          if (rel === 'stylesheet' || rel === 'preload' || rel === 'modulepreload') {
            const href = linkAttrs?.href
            const integrity = linkAttrs?.integrity
            // Only add integrity to resources that do not already have one
            if (href && !integrity) {
              // Get the integrity hash from our static database
              const hash = sriHashes[href]
              // Set the integrity hash in HTML if found
              if (hash) {
                $(link).attr('integrity', hash)
              }
            }
          }
        })
      })
    }
  })
})