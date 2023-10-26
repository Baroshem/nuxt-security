import { defineNitroPlugin } from '#imports'
import type { H3Event } from 'h3'

// To prevent the nonce attribute from being added to literal strings,
// we need to make sure that the tag is not preceded by a single or double quote.
// This is done by using a negative lookbehind assertion. See https://www.regular-expressions.info/lookaround.html
// See https://regex101.com/r/DBE57j/1 for some examples.
const tagNotPrecededByQuotes = (tag: string) => new RegExp(`(?<!['|"])<${tag}`, 'g')

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    if (isPrerendering(event)) {
      // In SSG mode, do not inject nonces in html
      // However first make sure we erase nonce placeholders from CSP meta
      html.head = html.head.map((meta) => {
        if (!meta.startsWith('<meta http-equiv="Content-Security-Policy"')) { return meta }
        return meta.replaceAll("'nonce-{{nonce}}'", '')
      })
      return
    }
    const nonce = parseNonce(`${event.node.res.getHeader('Content-Security-Policy')}`)

    if (!nonce) { return }

    // Replace nonce attribute in http-equiv meta tag
    html.head = html.head.map((meta) => {
      if (!meta.startsWith('<meta http-equiv="Content-Security-Policy"')) { return meta }
      return meta.replaceAll('{{nonce}}', nonce)
    })

    // Add nonce attribute to all link tags
    html.head = html.head.map(link => link.replaceAll(tagNotPrecededByQuotes('link'), `<link nonce="${nonce}"`))
    html.bodyAppend = html.bodyAppend.map(link => link.replaceAll(tagNotPrecededByQuotes('link'), `<link nonce="${nonce}"`))

    // Add nonce attribute to all script tags
    html.head = html.head.map(script => script.replaceAll(tagNotPrecededByQuotes('script'), `<script nonce="${nonce}"`))
    html.bodyAppend = html.bodyAppend.map(script => script.replaceAll(tagNotPrecededByQuotes('script'), `<script nonce="${nonce}"`))

    // Add nonce attribute to all style tags
    html.head = html.head.map(style => style.replaceAll(tagNotPrecededByQuotes('style'), `<style nonce="${nonce}"`))
    html.bodyAppend = html.bodyAppend.map(style => style.replaceAll(tagNotPrecededByQuotes('style'), `<style nonce="${nonce}"`))
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
