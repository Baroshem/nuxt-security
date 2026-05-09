import { defineNitroPlugin } from 'nitropack/runtime'

// Simulates a third-party module (e.g. a minifier) that mutates inline <script>/<style>
// content during `render:html`. The generated CSP hashes must match the final served
// HTML.
const INLINE_SCRIPT_RE = /<script([^>]*)>([\s\S]*?)<\/script(?:\s+[^>]*)?\s*>/gi
const INLINE_STYLE_RE = /<style([^>]*)>([\s\S]*?)<\/style(?:\s+[^>]*)?\s*>/gi

function collapseWhitespace(content: string): string {
  return content.replace(/\s+/g, ' ').trim()
}

export default defineNitroPlugin((nitroApp) => {
  if (!import.meta.prerender) {
    return
  }
  nitroApp.hooks.hook('render:html', (html) => {
    for (const section of [html.head, html.bodyPrepend, html.body, html.bodyAppend]) {
      for (let i = 0; i < section.length; i++) {
        section[i] = section[i]!
          .replace(INLINE_SCRIPT_RE, (_, attrs, inner) => {
            if (!inner) return `<script${attrs}></script>`
            return `<script${attrs}>${collapseWhitespace(inner)}</script>`
          })
          .replace(INLINE_STYLE_RE, (_, attrs, inner) => {
            if (!inner) return `<style${attrs}></style>`
            return `<style${attrs}>${collapseWhitespace(inner)}</style>`
          })
      }
    }
  })
})
