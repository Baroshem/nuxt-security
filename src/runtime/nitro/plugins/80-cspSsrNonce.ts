import { defineNitroPlugin } from '#imports'
import { resolveSecurityRules } from '../utils'

const LINK_RE = /<link([^>]*?>)/g
const SCRIPT_RE = /<script([^>]*?>)/g
const STYLE_RE = /<style([^>]*?>)/g

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit in SSG mode
    if (import.meta.prerender) {
      return
    }

    // Exit if no CSP defined
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.headers || !rules.headers.contentSecurityPolicy || !rules.nonce) {
      return
    }


    const nonce = event.context.security.nonce!
    // Scan all relevant sections of the NuxtRenderHtmlContext
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = event.context.security.cheerios!
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
  })
})
