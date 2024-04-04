import { defineNitroPlugin, getRouteRules, setResponseHeader } from '#imports'
import { type CheerioAPI } from 'cheerio'
import { isPrerendering } from '../utils'
import type { H3Event } from "h3"

const LINK_RE = /<link([^>]*?>)/g
const SCRIPT_RE = /<script([^>]*?>)/g
const STYLE_RE = /<style([^>]*?>)/g


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
        cheerios[section] = cheerios[section].map($ => {
          // Add nonce to all link tags
          $ = $.replace(LINK_RE, (match, rest)=>{
            return `<link nonce="${nonce}"` + rest
          })
          // Add nonce to all script tags
          $ = $.replace(SCRIPT_RE, (match, rest)=>{
            return `<script nonce="${nonce}"` + rest
          })
          // Add nonce to all style tags
          $ = $.replace(STYLE_RE, (match, rest)=>{
            return `<style nonce="${nonce}"` + rest
          })
          return $
        })
      }
    }

  })

  nitroApp.hooks.hook('beforeResponse', (event) => {
    const nonce = event.context.nonce as string
    // Exit if no CSP defined
    const { security } = getRouteRules(event)
    if (!security?.headers || !security.headers.contentSecurityPolicy) {
      return
    }

    setNonceInCsp(event, nonce)
  })

  // Insert hashes in the CSP meta tag for both the script-src and the style-src policies
  function setNonceInCsp(event: H3Event, nonce?: string) {
    const headers = getResponseHeaders(event)
    if (!headers['content-security-policy']) {
      return
    }
    const newCspHeader = headers['content-security-policy'].split('; ').map(token => token.split(' ').filter(source => !source.startsWith("'nonce-") || source === "'nonce-{{nonce}}'")
      .map(source => {
        source = source.trim()
        if (source === "'nonce-{{nonce}}'") {
          return nonce ? `'nonce-${nonce}'` : ''
        } else {
          return source
        }
      }).filter(source => source).join(' ')).join('; ')
    setResponseHeader(event, 'Content-Security-Policy', newCspHeader)
  }
})
