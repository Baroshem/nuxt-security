import { useStorage, defineNitroPlugin, getRouteRules } from '#imports'
import { isPrerendering } from '../utils'
import { type CheerioAPI } from 'cheerio'

const SCRIPT_RE = /<script((?=[^>]+\bsrc="([\w:.\-\\/]+)")(?![^>]+\bintegrity="[\w\-+/=]+")[^>]+)(?:\/>|><\/script>)/g
const LINK_RE = /<link((?=[^>]+\brel="(?:stylesheet|preload|modulepreload)")(?=[^>]+\bhref="([\w:\\.\-/]+)")(?![^>]+\bintegrity="[\w\-+/=]+")[^>]+)>/g

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, { event }) => {
    // Exit if SRI not enabled for this route
    const { security } = getRouteRules(event)
    if (!security?.sri) {
      return
    }

    // Retrieve the sriHases that we computed at build time
    //
    // - If we are in a pre-rendering step of nuxi generate
    //   Then the /integrity directory does not exist in server assets
    //   But it is still in the .nuxt build directory
    //
    // - Conversely, if we are in a standalone SSR server pre-built by nuxi build
    //   Then we don't have a .nuxt build directory anymore
    //   But we did save the /integrity directory into the server assets    
    const prerendering = isPrerendering(event)
    const storageBase = prerendering ? 'build' : 'assets'   
    const sriHashes = await useStorage(storageBase).getItem<Record<string, string>>('integrity:sriHashes.json') || {}

    
    // Scan all relevant sections of the NuxtRenderHtmlContext
    // Note: integrity can only be set on scripts and on links with rel preload, modulepreload and stylesheet
    // However the SRI standard provides that other elements may be added to that list in the future
    type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
    const sections = ['body', 'bodyAppend', 'bodyPrepend', 'head'] as Section[]
    const cheerios = event.context.cheerios as Record<Section, CheerioAPI[]>
    for (const section of sections) {
      cheerios[section]=cheerios[section].map($=>{
        $ = $.replace(SCRIPT_RE,(match, rest, src)=>{
          const hash = sriHashes[src]
          if (hash) {
            const integrityScript = `<script integrity="${hash}"${rest}></script>`
            event.context.cache.scripts.set(src, hash)
            return integrityScript
          }
          return match
        })
        $ = $.replace(LINK_RE,(match, rest, href)=>{
          const hash = sriHashes[href]
          if (hash) {
            const integrityLink = `<link integrity="${hash}"${rest}>`
            event.context.cache.links.set(href, hash)
            return integrityLink
          }
          return match
        })
        return $
      })
    }
  })
})
