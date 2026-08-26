import { defineNitroPlugin } from 'nitropack/runtime'
import { resolveSecurityRules } from '../context'
import { generateRandomNonce } from '../../../utils/crypto'

const LINK_RE = /<link\b([^>]*?>)/gi
const NONCE_RE = /nonce="[^"]+"/i
const SCRIPT_RE = /<script\b([^>]*?>)/gi
const STYLE_RE = /<style\b([^>]*?>)/gi
const QUOTE_MASK_RE = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
const QUOTE_RESTORE_RE = /__QUOTE_PLACEHOLDER_(\d+)__/g
// Chunk-scope regexes: negative lookahead so we don't re-stamp scripts/styles/links
// that were already noncified by the `render:html` hook (head / bodyPrepend, which
// still work in streaming mode).
const CHUNK_SCRIPT_RE = /<script(?![^>]*\snonce=)([^>]*>)/g
const CHUNK_STYLE_RE = /<style(?![^>]*\snonce=)([^>]*>)/g
const CHUNK_LINK_RE = /<link(?![^>]*\snonce=)([^>]*>)/g

function injectNonceToTags(element: string, nonce: string) {
  // Skip non-string elements
  if (typeof element !== 'string') {
    return element;
  }
  const quotes: string[] = [];

  // Mask attributes to avoid manipulating stringified elements
  let maskedElement = element.replace(QUOTE_MASK_RE, (match) => {
    quotes.push(match);
    return `__QUOTE_PLACEHOLDER_${quotes.length - 1}__`;
  });
  // Add nonce to all link tags
  maskedElement = maskedElement.replace(LINK_RE, (match, rest) => {
    if (NONCE_RE.test(rest)) {
      return match.replace(NONCE_RE, `nonce="${nonce}"`);
    }
    return `<link nonce="${nonce}"` + rest
  })
  // Add nonce to all script tags
  maskedElement = maskedElement.replace(SCRIPT_RE, (match, rest) => {
    return `<script nonce="${nonce}"` + rest
  })
  // Add nonce to all style tags
  maskedElement = maskedElement.replace(STYLE_RE, (match, rest) => {
    return `<style nonce="${nonce}"` + rest
  })

  // Restore the original quoted content.
  const restoredHtml = maskedElement.replace(QUOTE_RESTORE_RE, (match, index) => {
    return quotes[parseInt(index, 10)];
  });

  return restoredHtml;
}

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
      const nonce = generateRandomNonce()
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
      html[section] = html[section].map((element) => injectNonceToTags(element, nonce))
    }

    // Add meta header for Vite in development
    if (import.meta.dev) {
      html.head.push(
        `<meta property="csp-nonce" nonce="${nonce}">`,
      )
    }
  })

  // Streaming SSR (Nuxt 4.5+ `experimental.ssrStreaming: true`) flushes body chunks
  // to the wire before the `render:html` hook can mutate `body`/`bodyAppend` — so
  // scripts injected there (notably `window.__NUXT__` and `__NUXT_DATA__`) reach
  // the browser without a nonce and are blocked by a strict CSP.
  // The `render:html:chunk` hook fires once per streamed chunk and lets us patch
  // those tags on their way out. In buffered mode this hook simply never fires,
  // so behavior for non-streaming apps is unchanged.
  // We use a negative lookahead so we do NOT re-stamp scripts that were already
  // noncified via `render:html` (head / bodyPrepend still work in streaming mode).
  // Cast the hook name because `render:html:chunk` is only declared on newer
  // Nitro/Nuxt versions; on older versions the cast is a no-op at runtime.
  nitroApp.hooks.hook(
    'render:html:chunk' as 'render:html',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((ctx: { chunk: Uint8Array | string }, { event }: { event: any }) => {
      const rules = resolveSecurityRules(event)
      if (
        !rules.enabled
        || !rules.headers
        || !rules.headers.contentSecurityPolicy
        || !rules.nonce
      ) {
        return
      }
      const nonce = event.context?.security?.nonce
      if (!nonce) return

      const chunkIsString = typeof ctx.chunk === 'string'
      const text = chunkIsString
        ? (ctx.chunk as string)
        : Buffer.from(ctx.chunk as Uint8Array).toString('utf-8')

      // Cheap prefilter — chunks without any of these tags are the common case.
      if (!/<(?:script|style|link)\b/i.test(text)) return

      const patched = text
        .replace(CHUNK_SCRIPT_RE, `<script nonce="${nonce}"$1`)
        .replace(CHUNK_STYLE_RE, `<style nonce="${nonce}"$1`)
        .replace(CHUNK_LINK_RE, `<link nonce="${nonce}"$1`)

      if (patched === text) return

      ctx.chunk = chunkIsString
        ? patched
        : (Buffer.from(patched, 'utf-8') as unknown as Uint8Array)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  )
})
