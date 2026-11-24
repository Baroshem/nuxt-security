import { getRouteRules } from 'nitropack/runtime'
import { getResponseHeader, getResponseHeaders, removeResponseHeader, setResponseHeader } from 'h3'
import type { H3Event } from 'h3'
import type { NitroApp } from 'nitropack/types'

// The server runtime on Nitro v2, `#nuxt-security/server` points here or to nitro3.ts
export * from 'h3'
export { defineNitroPlugin, useRuntimeConfig, useStorage } from 'nitropack/runtime'
export { getRouteRules }

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
    if (import.meta.prerender && response.body instanceof ReadableStream) response.body = await new Response(response.body).text()
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
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    if (String(getResponseHeader(event, 'content-type') || '').includes('text/html')) return fn(event, eventHeaders(event))
  })
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
// __unenv__ is in-process localFetch context, never an incoming HTTP header.
// __unenv__ 僅由程序內 localFetch 提供，並非 HTTP header。
export const getInheritedNonce = (event: H3Event): string | undefined => Reflect.get(event.node.req, '__unenv__')?.security?.nonce

/** Bounded read with a replay stream for raw Node consumers. / 有界讀取並重播給原始 Node reader。 */
export async function enforceBodyLimit(event: H3Event, limit: number) {
  const { readLimitedBody } = await import('../../../utils/limitedBody')
  const { Readable } = await import('node:stream')
  const request = event.node.req
  // Do not let an oversized stream destroy the socket before a 413 can be sent. / 保留 socket 以傳送 413。
  const cached = event._requestBody || request[Symbol.for('h3RawBody')] || request.rawBody || request.body
  let bytes: Uint8Array
  if (cached) {
    const { readRawBody } = await import('h3')
    bytes = await readRawBody(event, false) || new Uint8Array()
    if (bytes.byteLength > limit) throw Object.assign(new Error('Payload Too Large'), { statusCode: 413 })
  } else bytes = await readLimitedBody(request.iterator({ destroyOnReturn: false }), limit)
  const body = Buffer.from(bytes)
  event._requestBody = body
  const replay = Readable.from(body.length ? [body] : [])
  const streamMembers = new Set(['on', 'once', 'addListener', 'removeListener', 'off', 'pipe', 'unpipe', 'read', 'resume', 'pause', 'setEncoding', 'isPaused', 'readable', 'readableEnded', 'readableLength', '_readableState', Symbol.asyncIterator])
  event.node.req = new Proxy(request, {
    get(target, name) {
      const value = streamMembers.has(name) ? Reflect.get(replay, name, replay) : Reflect.get(target, name, target)
      return typeof value === 'function' ? value.bind(streamMembers.has(name) ? replay : target) : value
    }
  })
}
