import { getRouteRules } from 'nitropack/runtime'
import { getResponseHeader, getResponseHeaders, removeResponseHeader, setResponseHeader } from 'h3'
import type { H3Event } from 'h3'
import type { NitroApp } from 'nitropack/types'

// The server runtime on Nitro v2, `#nuxt-security/server` points here or to nitro3.ts
export * from 'h3'
export { defineNitroPlugin, useRuntimeConfig, useStorage } from 'nitropack/runtime'

function eventHeaders(event: H3Event) {
  return {
    get: (name: string) => getResponseHeader(event, name),
    set: (name: string, value: string) => setResponseHeader(event, name, value),
    delete: (name: string) => removeResponseHeader(event, name),
    entries: () => Object.entries(getResponseHeaders(event)).map(([name, value]) => [name, Array.isArray(value) ? value.join(';') : String(value)])
  }
}

/**
 * Calls fn with the HTML of each rendered page, once every render:html listener has run. fn may return new HTML.
 */
export function onPageHtml(nitroApp: NitroApp, fn: (event: H3Event, html: unknown) => unknown) {
  nitroApp.hooks.hook('render:response', async(response, { event }) => {
    const html = await fn(event, response.body)
    if (typeof html === 'string') {
      response.body = html
    }
  })
}

/**
 * Calls fn with the response headers of each rendered page, after onPageHtml.
 */
export function onPageResponse(nitroApp: NitroApp, fn: (event: H3Event, headers: ReturnType<typeof eventHeaders>) => unknown) {
  nitroApp.hooks.hook('render:response', (_response, { event }) => fn(event, eventHeaders(event)))
}

/**
 * Calls fn with the headers of each response before it is sent.
 */
export function onResponse(nitroApp: NitroApp, fn: (event: H3Event, headers: ReturnType<typeof eventHeaders>) => unknown) {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (!event.node.res.headersSent) {
      return fn(event, eventHeaders(event))
    }
  })
}

export const getRouteRulesHeaders = (event: H3Event) => getRouteRules(event).headers

// h3 v1 keeps the body it read, so the route handler can read it again
export const getBodyEvent = (event: H3Event) => event
