import type { NitroAppPlugin, NitroApp } from 'nitropack'
import type { H3Event } from 'h3'
import { extname } from 'pathe'
import { loadNuxtConfig } from '@nuxt/kit'
import type {
  SriOptions
} from '../../../types'
import { useRuntimeConfig, useStorage } from '#imports'

interface NuxtRenderHTMLContext {
  island?: boolean
  htmlAttrs: string[]
  head: string[]
  bodyAttrs: string[]
  bodyPrepend: string[]
  body: string[]
  bodyAppend: string[]
}

export default <NitroAppPlugin> async function (nitroApp: NitroApp) {
  nitroApp.hooks.hook('render:html', async (html: NuxtRenderHTMLContext, { event }: { event: H3Event }) => {
    const sriOptions = useRuntimeConfig().security.sri as SriOptions
    console.log(sriOptions)
    const prerendering = isPrerendering(event)

    // Retrieve the sriHases that we computed at build time
    //
    // - If we are in a pre-rendering step of nuxi dev:generate
    //   Then the /integrity directory does not exist in server assets
    //   But it is still in the .nuxt build directory
    //
    // - Conversely, if we are in a standalone SSR server pre-built by nuxi dev:build
    //   Then we don't have a .nuxt build directory anymore
    //   But we did save the /integrity directory into the server assets

    const storageBase = prerendering ? 'build' : 'assets'
    const sriHashes = await useStorage(storageBase).getItem('integrity:sriHashes.json')
    const hashesForSsgCSP:Set<string> = new Set()
    
    // Inject SRI hashes in <head> in both SSR and SSG modes
    const elements = html.head
    const modifiedElements: string[] = []
    for (const element of elements) {
      let modifiedElement = ''
      let currentPos = 0
      const hashInsertPositions = getHashesToInsert(element)
      for (const hashInsertPosition of hashInsertPositions) {
        const { insertPos, hash } = hashInsertPosition
        const startStr = element.substring(currentPos, insertPos)
        modifiedElement += startStr + ` integrity="${hash}"`
        currentPos = insertPos
      }
      modifiedElement += element.substring(currentPos)
      modifiedElements.push(modifiedElement)
    }
    html.head = modifiedElements

    // Inject hashes in CSP meta only for pre-rendering mode  
    // SSR is not supported, as CSP is better provided via headers and nonce-{{nonce}}
    if (prerendering) {
      const metaPattern = /<meta http-equiv="Content-Security-Policy" content="(.*?)">/s
      html.head = html.head.map((headLine) => {
        const match = metaPattern.exec(headLine)
        if (!match) {
          return headLine
        } else {
          const content = match[1]
          const modifiedContent = addSriHashesToCSP(content, hashesForSsgCSP)
          const newLine = headLine.replace(content, modifiedContent)
          return newLine
        }
      })
    }

    function getHashesToInsert(element: string) {
      const scriptHashesToInsert = scanScriptTags(element)
      const linkHashesToInsert = scanLinkTags(element)
      const hashesToInsert = [...scriptHashesToInsert, ...linkHashesToInsert]
      return hashesToInsert.sort((a, b) => a.insertPos - b.insertPos)
    }
  
    function scanScriptTags(element: string) {
      const scriptSrcPattern = /<script .*?src="(.+?)".*?><\/script>/gs
      const hashesToInsert: Array<{ insertPos: number, hash: string }> = []
      let scriptSrcMatch: RegExpExecArray | null
      
      // Find all the <script src="..."></script> strings
      // And extract the src file to lookup the corresponding hash
      while ((scriptSrcMatch = scriptSrcPattern.exec(element)) !== null) {
        const tag = scriptSrcMatch[0]
        const src = scriptSrcMatch[1]
        const index = scriptSrcMatch.index
        const insertPos = index + tag.length - '></script>'.length
        let hash: string

        // First let's find if the integrity attribute is already present
        const scriptIntegrityPattern = /<script .*?integrity="(.+?)".*?><\/script>/s
        const scriptIntegrityMatch = scriptIntegrityPattern.exec(tag)
        if (scriptIntegrityMatch) {
          // There is already an integrity checksum here, so don't insert
          hash = scriptIntegrityMatch[1]
        } else {

          // There is no integrity checksum here
          // Let's lookup the src and mark for insertion
          hash = sriHashes[src]
          if (!hash) {
            continue
          }
          hashesToInsert.push({ insertPos, hash })
        }
    
        // Finally, let's add the hash into CSP
        hashesForSsgCSP.add(hash)
      }
      return hashesToInsert
    }
  
    function scanLinkTags(element: string) {
      const linkHrefPattern = /<link .*?href="(.+?)".*?>/gs
      const hashesToInsert: Array<{ insertPos: number, hash: string }> = []
      let linkHrefMatch: RegExpExecArray | null
  
      // Find all <link href="..."> strings
      // And extract the href to lookup the corresponding hash
      while ((linkHrefMatch = linkHrefPattern.exec(element)) !== null) {
        const tag = linkHrefMatch[0]
        const href = linkHrefMatch[1]
        const index = linkHrefMatch.index
        const insertPos = index + tag.length - '>'.length
        let hash: string

        // First let's find if the integrity attribute is already present
        const linkIntegrityPattern = /<link .*?integrity="(.+?)".*?>/s
        const linkIntegrityMatch = linkIntegrityPattern.exec(tag)
        if (linkIntegrityMatch) {
          // There is already an integrity checksum here, so don't insert
          hash = linkIntegrityMatch[1]
        } else {
          // There is no integrity checksum here, first exclude unsupported rel types
          const linkRelPattern = /<link .*?rel="(.+?)".*?>/s
          const linkRelMatch = linkRelPattern.exec(tag)
          const rel = linkRelMatch?.[1] ?? ''
          const supportedRelTypes = ['modulepreload', 'prefetch', 'preload', 'stylesheet']
          if (!supportedRelTypes.some(relType => rel.includes(relType))) {
            continue
          }

          // Let's look up the href and mark for insertion
          hash = sriHashes[href]
          if (!hash) {
            continue
          }       
          hashesToInsert.push({ insertPos, hash })
        }

        // Finally, let's add the hash into CSP if it is a script
        const linkAsScriptPattern = /<link .*?as="script".*?>/s
        const linkAsScriptMatch = linkAsScriptPattern.exec(tag)
        if (linkAsScriptMatch) {
          hashesForSsgCSP.add(hash)
        }
      }
      return hashesToInsert
    }
  })

  

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


    /**
   * Only enable behavior if Content Security pPolicy is enabled,
   * initial page is prerendered and generated file type is HTML.
   * @param event H3Event
   * @param options ModuleOptions
   * @returns boolean
   */
    function isPrerendering(event: H3Event): boolean {
      const nitroPrerenderHeader = 'x-nitro-prerender'
  
      // Page is not prerendered
      if (!event.node.req.headers[nitroPrerenderHeader]) {
        return false
      }
  
      // File is not HTML
      if (!['', '.html'].includes(extname(event.node.req.headers[nitroPrerenderHeader] as string))) {
        return false
      }
  
      return true
    }
}
