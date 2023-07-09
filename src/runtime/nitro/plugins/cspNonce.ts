import type { NitroAppPlugin } from 'nitropack'
import type { H3Event } from 'h3'
import type {
  ModuleOptions
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
  nitro.hooks.hook('render:html', (html: NuxtRenderHTMLContext, { event }: { event: H3Event }) => {
    const nonce = parseNonce(`${event.node.res.getHeader('Content-Security-Policy')}`)

    if (!nonce) { return }

    // Add nonce attribute to all link tags
    html.head = html.head.map(link => link.replaceAll(/<link/g, `<link nonce="${nonce}"`))
    html.bodyAppend = html.bodyAppend.map(link => link.replaceAll(/<link/g, `<link nonce="${nonce}"`))

    // Add nonce attribute to all script tags
    html.head = html.head.map(script => script.replaceAll(/<script/g, `<script nonce="${nonce}"`))
    html.bodyAppend = html.bodyAppend.map(script => script.replaceAll(/<script/g, `<script nonce="${nonce}"`))
  })

  function parseNonce (content: string) {
    const noncePattern = /nonce-([a-zA-Z0-9+/=]+)/
    const match = content?.match(noncePattern)
    if (match && match[1]) {
      return match[1]
    }
    return null
  }
}
