import { defineNitroPlugin } from '#imports'
import { randomBytes } from 'node:crypto'
import { resolveSecurityRules } from '../context'

const LINK_RE = /<link([^>]*?>)/gi
const SCRIPT_RE = /<script([^>]*?>)/gi
const STYLE_RE = /<style([^>]*?>)/gi


/**
 * This plugin generates a nonce for the current request and adds it to the HTML.
 * It only runs in SSR mode.
 */
export default defineNitroPlugin((nitroApp) => {
  // Exit in SSG mode
  if (import.meta.prerender) {
    return
  }

  // Genearate a 16-byte random nonce for each request.
  nitroApp.hooks.hook('request', (event) => {
    if (event.context.security?.nonce) {
      // When rendering server-only (NuxtIsland) components, each component will trigger a request event.
      // The request context is shared between the event that renders the actual page and the island request events.
      // Make sure to only generate the nonce once.
      return
    }

    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.nonce && !import.meta.prerender) {
      const nonce = randomBytes(16).toString('base64')
      event.context.security!.nonce = nonce
    }
  })

  // Set the nonce attribute on all script, style, and link tags.
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit if no CSP defined
    const rules = resolveSecurityRules(event)
    if (
      !rules.enabled ||
      !rules.headers ||
      !rules.headers.contentSecurityPolicy ||
      !rules.nonce
    ) {
      return
    }

    const nonce = event.context.security!.nonce!
    // Scan all relevant sections of the NuxtRenderHtmlContext
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    for (const section of sections) {
      html[section] = html[section].map((element) => {
        // Add nonce to all link tags
        element = element.replace(LINK_RE, (match, rest) => {
          return `<link nonce="${nonce}"` + rest
        })
        // Add nonce to all script tags
        element = element.replace(SCRIPT_RE, (match, rest) => {
          return `<script nonce="${nonce}"` + rest
        })
        // Add nonce to all style tags
        element = element.replace(STYLE_RE, (match, rest) => {
          return `<style nonce="${nonce}"` + rest
        })
        return element
      })
    }
  })
})
