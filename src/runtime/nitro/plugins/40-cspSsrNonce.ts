import { defineNitroPlugin, getInheritedNonce } from '#nuxt-security/server'
import { resolveSecurityRules } from '../context'
import { generateRandomNonce } from '../../../utils/crypto'
import { injectNonceToTags } from '../../../utils/nonce'

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
      const inherited = /(?:^|\/)__nuxt_island\//.test(event.path.split('?')[0]) ? getInheritedNonce(event) : undefined
      const nonce = inherited || generateRandomNonce()
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
      !(rules.headers.contentSecurityPolicy || rules.headers.contentSecurityPolicyReportOnly) ||
      !rules.nonce
    ) {
      return
    }

    const nonce = event.context.security!.nonce!
    // Scan all relevant sections of the NuxtRenderHtmlContext
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    for (const section of sections) {
      html[section] = html[section].map((element) => injectNonceToTags(element, nonce))
    }

    // Add meta header for Vite in development
    if (import.meta.dev) {
      html.head.push(
        `<meta property="csp-nonce" nonce="${nonce}">`,
      )
    }
  })
  // Streaming emits hydration/config tags after the shell. / 串流在 shell 之後才輸出 hydration/config。
  nitroApp.hooks.hook('render:html:close', (html, { event }) => {
    const rules = resolveSecurityRules(event)
    const nonce = event.context.security?.nonce
    if (!rules.enabled || !rules.nonce || !nonce) return
    html.bodyAppend = html.bodyAppend.map(element => injectNonceToTags(element, nonce))
  })

})
