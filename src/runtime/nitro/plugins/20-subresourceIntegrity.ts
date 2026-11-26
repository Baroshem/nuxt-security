import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
//@ts-expect-error : we are importing from the virtual file system
import sriHashes from '#sri-hashes'
import { resolveSecurityRules } from '../context'
import type { Section } from '../../../types/module'

const SCRIPT_RE = /<script((?=[^>]+\bsrc="([^"]+)")(?![^>]+\bintegrity="[^"]+")[^>]+)(?:\/>|><\/script>)/g
const LINK_RE = /<link((?=[^>]+\brel="(?:stylesheet|preload|modulepreload)")(?=[^>]+\bhref="([^"]+)")(?![^>]+\bintegrity="[\w\-+/=]+")[^>]+)>/g

/**
 * This plugin adds Subresource Integrity (SRI) hashes to script and link tags in the HTML.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Exit if SRI not enabled for this route
    const rules = resolveSecurityRules(event)
    if (!rules.enabled || !rules.sri) {
      return
    }

    const relativeBase = import.meta.prerender && useRuntimeConfig(event).app.baseURL === './'

    // Relative static output uses './' for the same assets indexed from '/'.
    function getIntegrity(url: string): string | undefined {
      return sriHashes[url] ?? (relativeBase && url.startsWith('./') ? sriHashes[url.slice(1)] : undefined)
    }

    // Scan all relevant sections of the NuxtRenderHtmlContext
    // Note: integrity can only be set on scripts and on links with rel preload, modulepreload and stylesheet
    // However the SRI standard provides that other elements may be added to that list in the future
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    for (const section of sections) {
      html[section] = html[section].map(element => {
        // Skip non-string elements
        if (typeof element !== 'string') {
          return element;
        }

        element = element.replace(SCRIPT_RE, (match, rest: string, src: string) => {
          const hash = getIntegrity(src)
          if (hash) {
            const integrityScript = `<script integrity="${hash}"${rest}></script>`
            return integrityScript
          } else {
            return match
          }
        })

        element = element.replace(LINK_RE, (match, rest: string, href: string) => {
          const hash = getIntegrity(href)
          if (hash) {
            const integrityLink = `<link integrity="${hash}"${rest}>`
            return integrityLink
          } else {
            return match
          }
        })

        return element
      })
    }
  })
})
