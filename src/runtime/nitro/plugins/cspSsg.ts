import path from 'node:path'
import crypto from 'node:crypto'
import type { NitroAppPlugin } from 'nitropack'
import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import type {
  ModuleOptions,
  ContentSecurityPolicyValue,
  SecurityHeaders,
  MiddlewareConfiguration
} from '../../../types'
import defu from 'defu'

interface NuxtRenderHTMLContext {
  island?: boolean
  htmlAttrs: string[]
  head: string[]
  bodyAttrs: string[]
  bodyPrepend: string[]
  body: string[]
  bodyAppend: string[]
}

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.hook('render:html', (html: NuxtRenderHTMLContext, { event }: { event: H3Event }) => {
    // Content Security Policy
    const moduleOptions = useRuntimeConfig().security as ModuleOptions

    if (!isContentSecurityPolicyEnabled(event, moduleOptions)) {
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

    const securityHeaders = moduleOptions.headers as SecurityHeaders
    const contentSecurityPolicies: ContentSecurityPolicyValue = (securityHeaders.contentSecurityPolicy as MiddlewareConfiguration<ContentSecurityPolicyValue>).value || securityHeaders.contentSecurityPolicy

    html.head.push(generateCspMetaTag(contentSecurityPolicies, scriptHashes))
  })

  function generateCspMetaTag(policies: ContentSecurityPolicyValue, scriptHashes: string[]) {
    const unsupportedPolicies = {
      'frame-ancestors': true,
      'report-uri': true,
      sandbox: true
    }

    const tagPolicies = defu(policies) as ContentSecurityPolicyValue
    if (scriptHashes.length > 0) {
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

      contentArray.push(`${key} ${policyValue}`)
    }
    const content = contentArray.join('; ')

    return `<meta http-equiv="Content-Security-Policy" content="${content}">`
  }

  function generateHash(content: string, hashAlgorithm: string) {
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
  function isContentSecurityPolicyEnabled(event: H3Event, options: ModuleOptions): boolean {
    const nitroPrerenderHeader = 'x-nitro-prerender'

    // Page is not prerendered
    if (!event.node.req.headers[nitroPrerenderHeader]) {
      return false
    }

    // File is not HTML
    if (!['', '.html'].includes(path.extname(event.node.req.headers[nitroPrerenderHeader]))) {
      return false
    }

    return true
  }
}
