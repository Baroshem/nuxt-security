import { defineNitroPlugin, getRouteRules, setResponseHeader, getRequestHeader } from '#imports'
import type { H3Event } from 'h3'
import * as cheerio from 'cheerio'
import type { ContentSecurityPolicyValue } from '~/src/module'
import { headerStringFromObject } from '../../utils/headers'


export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit in SSG mode
    if (isPrerendering(event)) {
      return
    }

    // Exit if no CSP defined
    const { security } = getRouteRules(event)
    if (!security?.headers || !security.headers.contentSecurityPolicy) {
      return
    }

    let nonce: string | undefined;

    // Parse HTML if nonce is enabled for this route
    if (security.nonce) { 
      nonce = event.context.nonce as string
      // Scan all relevant sections of the NuxtRenderHtmlContext
      type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
      const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
      for (const section of sections) {
        html[section] = html[section].map(element => {
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
    }
    // Generate CSP rules
    const csp = security.headers.contentSecurityPolicy
    const headerValue = generateCspRules(csp, nonce)

    // Update rules in HTTP header
    setResponseHeader(event, 'Content-Security-Policy', headerValue)
  })

  // Insert hashes in the CSP meta tag for both the script-src and the style-src policies
  function generateCspRules(csp: ContentSecurityPolicyValue, nonce?: string) {
    const generatedCsp = Object.fromEntries(Object.entries(csp).map(([key, value]) => {
      // Return boolean values unchanged
      if (typeof value === 'boolean') {
        return [key, value]
      }
      // Make sure nonce placeholders are eliminated
      const sources = (typeof value === 'string') ? value.split(' ').map(token => token.trim()).filter(token => token) : value
      const modifiedSources = sources
        .filter(source => !source.startsWith("'nonce-") || source === "'nonce-{{nonce}}'")
        .map(source => {
          if (source === "'nonce-{{nonce}}'") {
            return nonce ? `'nonce-${nonce}'` : ''
          } else {
            return source
          }
        })
        .filter(source => source)

      const directive = key as keyof ContentSecurityPolicyValue
      return [directive, modifiedSources]
    })) as ContentSecurityPolicyValue
    return headerStringFromObject('contentSecurityPolicy', generatedCsp)
  }

  /**
   * Detect if page is being pre-rendered
   * @param event H3Event
   * @returns boolean
   */
  function isPrerendering(event: H3Event): boolean {
    return !!getRequestHeader(event, 'x-nitro-prerender')
  }
})
