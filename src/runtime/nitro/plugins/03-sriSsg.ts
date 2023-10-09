import crypto from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import type { NitroAppPlugin } from 'nitropack'
import type { H3Event } from 'h3'
import { useNitro, tryUseNuxt } from '@nuxt/kit'
import { join, normalize, extname } from 'pathe'
import type {
  ModuleOptions,
  ContentSecurityPolicyValue,
  SecurityHeaders,
  MiddlewareConfiguration
} from '../../../types'
import { useRuntimeConfig } from '#imports'

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
  if (!tryUseNuxt()) {
    return
  }

  const publicAssets = useNitro().options.publicAssets
  const hashAlgorithm = 'sha384'
  const scriptHashTables: Record<string, string> = {}
  for (const publicAsset of publicAssets) {
    const { dir, baseURL = '' } = publicAsset
    const files = readdirSync(dir)
    for (const file of files) {
      const fileContent = readFileSync(normalize(join(dir, file)))
      const hash = generateHash(fileContent, hashAlgorithm)
      const key = normalize(join(baseURL, file))
      scriptHashTables[key] = hash
    }
  }

  nitro.hooks.hook('render:html', async (html: NuxtRenderHTMLContext, { event }: { event: H3Event }) => {
    // Content Security Policy
    const moduleOptions = useRuntimeConfig().security as ModuleOptions
    if (!isSriEnabled(event, moduleOptions)) {
      return
    }

    const foundSriHashes:Set<string> = new Set()

    for (const templatePart of ['head', 'bodyPrepend', 'bodyAppend']) {
      const elements: string[] = html[templatePart]
      const modifiedElements: string[] = []
      for (const element of elements) {
        const scriptPattern = /<script.*?src="(.*?)"(.*?)><\/script>/gsd
        let match: RegExpExecArray & { indices?: Array<[number, number]> } | null
        let modifiedElement = ''
        let currentPos = 0
        while ((match = scriptPattern.exec(element)) !== null) {
          const { 1: src, indices: [, , [, insertPos]] = [] } = match
          if (src) {
            const hash = await getHashForSource(src)
            foundSriHashes.add(hash)
            const startStr = element.substring(currentPos, insertPos)
            modifiedElement += startStr + ` integrity="${hash}"`
            currentPos = insertPos
          }
        }
        modifiedElement += element.substring(currentPos)
        modifiedElements.push(modifiedElement)
      }
      html[templatePart] = modifiedElements
    }

    const metaPattern = /<meta http-equiv="Content-Security-Policy" content="(.*?)">/gs
    html.head = html.head.map((headLine) => {
      const match = metaPattern.exec(headLine)
      if (!match) {
        return headLine
      } else {
        const content = match[1]
        const modifiedContent = addSriHashesToCSP(content, foundSriHashes)
        const newLine = headLine.replace(content, modifiedContent)
        return newLine
      }
    })
  })

  async function getHashForSource (src: string) {
    if (src.startsWith('https://')) {
      const response = await fetch(new URL(src))
      const content = await response.arrayBuffer()
      const hash = generateHash(Buffer.from(content), hashAlgorithm)
      return hash
    } else {
      return scriptHashTables[src]
    }
  }

  function addSriHashesToCSP (content: string, hashes: Set<string>) {
    const cspPolicies = content.split(';').map(policy => policy.trim())
    const scriptSrcDirective = cspPolicies.find(policy => policy.startsWith('script-src ')) ?? ''
    const scriptSrcSources = scriptSrcDirective.split(' ')
    scriptSrcSources[0] = 'script-src'
    const newSources = Array.from(hashes).map(hash => `'${hash}'`)
    scriptSrcSources.push(...newSources)
    const newSrcDirective = scriptSrcSources.join(' ')
    const newContent = content.replace(scriptSrcDirective, newSrcDirective)
    return newContent
  }

  function generateHash (content: Buffer, hashAlgorithm: string) {
    const hash = crypto.createHash(hashAlgorithm)
    hash.update(content)
    return `${hashAlgorithm}-${hash.digest('base64')}`
  }

  /**
   * Only enable behavior if
   * // initial page is prerendered // and generated file type is HTML.
   * @param event H3Event
   * @param options ModuleOptions
   * @returns boolean
   */
  function isSriEnabled (event: H3Event, options: ModuleOptions): boolean {
    const nitroPrerenderHeader = 'x-nitro-prerender'

    // Page is not prerendered
    if (!event.node.req.headers[nitroPrerenderHeader]) {
      return false
    }

    // File is not HTML
    if (!['', '.html'].includes(extname(event.node.req.headers[nitroPrerenderHeader]))) {
      return false
    }

    return true
  }
}
