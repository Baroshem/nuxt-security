import { defineNitroPlugin } from '#imports'
import type { H3Event } from 'h3'
import * as cheerio from 'cheerio'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    if (isPrerendering(event)) {
      // In SSG mode, do not inject nonces in html
      return
    }
    const nonce = parseNonce(`${event.node.res.getHeader('Content-Security-Policy')}`)

    if (!nonce) { return }

    // Replace nonce attribute in http-equiv meta tag
    html.head = html.head.map((meta) => {
      if (!meta.startsWith('<meta http-equiv="Content-Security-Policy"')) { return meta }
      return meta.replaceAll('{{nonce}}', nonce)
    })

    // Scan all relevant sections of the NuxtRenderHtmlContext
    for (const section of ['body', 'bodyAppend', 'bodyPrepend', 'head']) {
      const htmlRecords = html as unknown as Record<string, string[]>

      htmlRecords[section] = htmlRecords[section].map(element => {
        const $ = cheerio.load(element, null, false)
        // Add nonce to all link tags
        $('link').attr('nonce', nonce)
        // Add nonce to all script tags
        $('script').attr('nonce', nonce)
        // Add nonce to all style tags
        $('style').attr('nonce', nonce)
        return $.html()
      })
    }
  })

  function parseNonce (content: string) {
    const noncePattern = /nonce-([a-zA-Z0-9+/=]+)/
    const match = content?.match(noncePattern)
    if (match && match[1]) {
      return match[1]
    }
    return null
  }

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

    return true
  }
})
