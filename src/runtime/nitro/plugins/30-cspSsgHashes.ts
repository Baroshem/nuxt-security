import { defineNitroPlugin } from 'nitropack/runtime'
import { resolveSecurityRules } from '../context'
import { generateHash } from '../../../utils/crypto'


const INLINE_SCRIPT_RE = /<script(?![^>]*?\bsrc="[\w:.\-\\/]+")[^>]*>([\s\S]*?)<\/script>/gi
const INLINE_STYLE_RE = /<style[^>]*>([\s\S]*?)<\/style>/gi
const SCRIPT_RE = /<script(?=[^>]+\bsrc="[^"]+")(?=[^>]+\bintegrity="([\w\-+/=]+)")[^>]+(?:\/>|><\/script[^>]*?>)/gi
const STYLE_RE = /<link(?=[^>]+\brel="stylesheet")(?=[^>]+\bintegrity="([\w\-+/=]+)")[^>]+>/gi



/**
 * This plugin adds security hashes to the event context for later use in the CSP header.
 * It only runs in SSG mode.
 *
 * Hashes are computed in `render:response` rather than `render:html` so that they are
 * taken from the final serialized HTML, after all `render:html` listeners (including
 * third-party modules that transform inline scripts/styles, e.g. minifiers) have run.
 * This removes the dependency on plugin registration order when ensuring hashes match
 * the served content.
 */
export default defineNitroPlugin((nitroApp) => {
  // Exit in SSR mode
  if (!import.meta.prerender) {
    return
  }

  nitroApp.hooks.hook('render:response', async(response, { event }) => {
    // Exit if no CSP defined
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.headers || !rules.headers.contentSecurityPolicy) {
      return
    }

    event.context.security!.hashes = {
      script: new Set(),
      style: new Set()
    }
    const scriptHashes = event.context.security!.hashes.script
    const styleHashes = event.context.security!.hashes.style

    // Parse HTML if SSG is enabled for this route
    if (rules.ssg) {
      const { hashScripts, hashStyles, hashAlgorithm } = rules.ssg

      // Only process string bodies (HTML responses)
      const body = response.body
      if (typeof body !== 'string' || !body) {
        return
      }

      if (hashScripts) {
        // Parse all script tags
        const inlineScriptMatches = body.matchAll(INLINE_SCRIPT_RE)
        for (const [, scriptText] of inlineScriptMatches) {
          if (!scriptText) continue
          const hash = await generateHash(scriptText, hashAlgorithm)
          scriptHashes.add(`'${hash}'`)
        }
        const externalScriptMatches = body.matchAll(SCRIPT_RE)
        for (const [, integrity] of externalScriptMatches) {
          scriptHashes.add(`'${integrity}'`)
        }
      }

      // Parse all style tags
      if (hashStyles) {
        const inlineStyleMatches = body.matchAll(INLINE_STYLE_RE)
        for (const [, styleText] of inlineStyleMatches) {
          if (!styleText) continue
          const hash = await generateHash(styleText, hashAlgorithm)
          styleHashes.add(`'${hash}'`)
        }
        const externalStyleMatches = body.matchAll(STYLE_RE)
        for (const [, integrity] of externalStyleMatches) {
          styleHashes.add(`'${integrity}'`)
        }
      }
    }
  })
})
