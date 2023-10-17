import path from 'node:path'
import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import defu from 'defu'
import type {
  ModuleOptions
} from '../../../types'
import type {
  ContentSecurityPolicyValue
} from '../../../types/headers'
import { defineNitroPlugin, useRuntimeConfig } from '#imports'

const moduleOptions = useRuntimeConfig().security

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Content Security Policy

    if (!isContentSecurityPolicyEnabled(event, moduleOptions)) {
      return
    }

    if (!moduleOptions.headers) {
      return
    }

    const scriptPattern = /<script[^>]*>(.*?)<\/script>/gs
    const scriptHashes: string[] = []
    const hashAlgorithm = 'sha256'

    let match
    while ((match = scriptPattern.exec(html.bodyAppend.join(''))) !== null) {
      if (match[1]) {
        scriptHashes.push(generateHash(match[1], hashAlgorithm))
      }
    }

    const cspConfig = moduleOptions.headers.contentSecurityPolicy

    if (cspConfig && typeof cspConfig !== 'string') {
      html.head.push(generateCspMetaTag(cspConfig, scriptHashes))
    }
  })

  function generateCspMetaTag (policies: ContentSecurityPolicyValue, scriptHashes: string[]) {
    const unsupportedPolicies:Record<string, boolean> = {
      'frame-ancestors': true,
      'report-uri': true,
      sandbox: true
    }

    const tagPolicies = defu(policies) as ContentSecurityPolicyValue
    if (scriptHashes.length > 0 && moduleOptions.ssg?.hashScripts) {
      // Remove '""'
      tagPolicies['script-src'] = (tagPolicies['script-src'] ?? []).concat(scriptHashes)
    }

    const contentArray: string[] = []
    for (const [key, value] of Object.entries(tagPolicies)) {
      if (unsupportedPolicies[key]) {
        continue
      }

      let policyValue: string

      if (Array.isArray(value)) {
        policyValue = value.join(' ')
      } else if (typeof value === 'boolean') {
        policyValue = ''
      } else {
        policyValue = value
      }

      if (value !== false) {
        contentArray.push(`${key} ${policyValue}`)
      }
    }
    const content = contentArray.join('; ')

    return `<meta http-equiv="Content-Security-Policy" content="${content}">`
  }

  function generateHash (content: string, hashAlgorithm: string) {
    const hash = crypto.createHash(hashAlgorithm)
    hash.update(content)
    return `'${hashAlgorithm}-${hash.digest('base64')}'`
  }

  /**
   * Only enable behavior if Content Security pPolicy is enabled,
   * initial page is prerendered and generated file type is HTML.
   * @param event H3Event
   * @param options ModuleOptions
   * @returns boolean
   */
  function isContentSecurityPolicyEnabled (event: H3Event, options: ModuleOptions): boolean {
    const nitroPrerenderHeader = 'x-nitro-prerender'
    const nitroPrerenderHeaderValue = event.node.req.headers[nitroPrerenderHeader]

    // Page is not prerendered
    if (!nitroPrerenderHeaderValue) {
      return false
    }

    // File is not HTML
    if (!['', '.html'].includes(path.extname(nitroPrerenderHeaderValue as string))) {
      return false
    }

    return true
  }
})
