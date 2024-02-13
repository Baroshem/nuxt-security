import { defineNitroPlugin, getRouteRules, setResponseHeader } from '#imports'
import { type CheerioAPI } from 'cheerio'
import type { ContentSecurityPolicyValue } from '~/src/module'
import { headerStringFromObject } from '../../utils/headers'
import { isPrerendering } from '../utils'


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
      const cheerios = event.context.cheerios as Record<Section, CheerioAPI[]>
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
    }

    // Generate CSP rules
    const csp = security.headers.contentSecurityPolicy
    const headerValue = generateCspRules(csp, nonce)

    // Update rules in HTTP header
    setResponseHeader(event, 'Content-Security-Policy', headerValue)
  })

  // Insert hashes in the CSP meta tag for both the script-src and the style-src policies
  function generateCspRules(csp: ContentSecurityPolicyValue, nonce?: string) {
    for (const key in csp) {
      const value = csp[key]
      if (typeof value !== 'boolean') {
        // Assuming it is originally an array, which we could change to a string later
        let sources: any = []
        if (typeof value === 'string') {
          for (const valuee in value.split(' ')) {
            const trim = valuee.trim()
            if (trim) {
              sources.push(trim)
            }
          }
        }
        else {
          sources = value
        }
        const modifiedSources = []
        for (const source in sources) {
          let tempSource;
          if (source === "'nonce-{{nonce}}'") {
            tempSource = nonce ? `'nonce-${nonce}'` : ''
          } else if (!source.startsWith("'nonce-")) {
            tempSource = nonce
          }
          if (tempSource) {
            modifiedSources.push(tempSource)
          }
        }
        const directive = key as keyof ContentSecurityPolicyValue
        csp[directive]=modifiedSources
      }
    }
    const generatedCsp = csp as ContentSecurityPolicyValue
    return headerStringFromObject('contentSecurityPolicy', generatedCsp)
  }
})
