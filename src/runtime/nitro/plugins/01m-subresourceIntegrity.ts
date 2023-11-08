import type { H3Event } from 'h3'
import { extname } from 'pathe'
import { useStorage } from '#imports'
import * as cheerio from 'cheerio'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    const prerendering = isPrerendering(event)

    // Retrieve the sriHases that we computed at build time
    //
    // - If we are in a pre-rendering step of nuxi generate
    //   Then the /integrity directory does not exist in server assets
    //   But it is still in the .nuxt build directory
    //
    // - Conversely, if we are in a standalone SSR server pre-built by nuxi build
    //   Then we don't have a .nuxt build directory anymore
    //   But we did save the /integrity directory into the server assets

    const storageBase = prerendering ? 'build' : 'assets'
    const sriHashes: Record<string, string> = await useStorage(storageBase).getItem('integrity:sriHashes.json') || {}
    
    // Scan all relevant sections of the NuxtRenderHtmlContext
    // Note: integrity can only be set on scripts and on links with rel preload, modulepreload and stylesheet
    // However the SRI standard provides that other elements may be added to that list in the future
    for (const section of ['body', 'bodyAppend', 'bodyPrepend', 'head']) {
      const htmlRecords = html as unknown as Record<string, string[]>

      htmlRecords[section] = htmlRecords[section].map(element => {
        const $ = cheerio.load(element, null, false)
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
        })
        return $.html()
      })
    }
  })

  /**
   * Detect if page is being pre-rendered
   * @param event H3Event
   * @returns boolean
   */
    function isPrerendering(event: H3Event): boolean {
      const nitroPrerenderHeader = 'x-nitro-prerender'
  
      // Page is not prerendered
      if (!event.node.req.headers[nitroPrerenderHeader]) {
        return false
      }
  
      // File is not HTML
      if (!['', '.html'].includes(extname(event.node.req.headers[nitroPrerenderHeader] as string))) {
        return false
      }
  
      return true
    }
})