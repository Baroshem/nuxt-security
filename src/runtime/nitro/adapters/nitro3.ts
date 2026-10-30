import { definePlugin } from 'nitro'
import { getRouteRules } from 'nitro/app'
import { H3Event } from 'nitro/h3'
import type { NitroApp } from 'nitro/types'

// The server runtime on Nitro v3, see nitro2.ts
export * from 'nitro/h3'
export { useRuntimeConfig } from 'nitro/runtime-config'
export { useStorage } from 'nitro/storage'
export const defineNitroPlugin = definePlugin

/**
 * Nuxt 5 has no render:response, so the page is read in render:html, after the listeners of other modules
 * (reorderNitroPlugins). Only changes to the head reach the page.
 */
export function onPageHtml(nitroApp: NitroApp, fn: (event: H3Event, html: unknown) => unknown) {
  nitroApp.hooks.hook('render:html', async(html, { event }) => {
    const page = await fn(event, `<head>${html.head.join('')}</head>${[...html.bodyPrepend, ...html.body, ...html.bodyAppend].join('')}`)
    const head = typeof page === 'string' ? page.match(/^<head>([\s\S]*)<\/head>/)?.[1] : undefined
    if (head !== undefined) {
      html.head = [head]
    }
  })
}

// h3 v2 applies route rule headers once the renderer has returned, so page headers go on the final response
const renderedPages = new WeakSet<object>()

export function onPageResponse(nitroApp: NitroApp, fn: (event: H3Event, headers: Headers) => unknown) {
  nitroApp.hooks.hook('render:html', (_html, { event }) => {
    renderedPages.add(event.context)
  })
  nitroApp.hooks.hook('response', (response, event) => {
    if (renderedPages.has(event.context)) {
      return fn(event, response.headers)
    }
  })
}

export function onResponse(nitroApp: NitroApp, fn: (event: H3Event, headers: Headers) => unknown) {
  nitroApp.hooks.hook('response', (response, event) => fn(event, response.headers))
}

// The response holds header values as strings, a route rule may hold false
export const getRouteRulesHeaders = (event: H3Event) => {
  const headers = getRouteRules(event.req.method, event.url.pathname).routeRules.headers
  return headers && Object.fromEntries(Object.entries(headers).map(([name, value]) => [name, String(value)]))
}

// h3 v2 reads the request body once, so middlewares read the body of a copy
export const getBodyEvent = (event: H3Event) => new H3Event(event.req.clone(), event.context)
