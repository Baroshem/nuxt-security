import { fileURLToPath } from 'node:url'
import { request } from 'node:http'
import { describe, expect, it } from 'vitest'
import { setup, fetch, url } from '@nuxt/test-utils'

describe('request byte gate and replay / 請求 bytes 檢查與重播', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/requestBody', import.meta.url)) })
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('enforces actual bytes for %s and accepts the exact limit', async method => {
    const safe = await fetch('/api/echo', { method, body: 'x'.repeat(32) })
    expect(safe.status).toBe(200)
    expect(await safe.json()).toEqual({ body: 'x'.repeat(32) })
    expect((await fetch('/api/echo', { method, body: 'x'.repeat(33) })).status).toBe(413)
  })
  it('preserves raw Node stream consumers after inspection', async () => {
    const res = await fetch('/api/raw', { method: 'POST', body: 'raw-stream-body' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ body: 'raw-stream-body' })
  })
  it('rejects a chunked body without Content-Length', async () => {
    const status = await new Promise<number>(resolve => {
      const req = request(url('/api/echo'), { method: 'PATCH', headers: { 'transfer-encoding': 'chunked' } }, res => { res.resume(); resolve(res.statusCode!) })
      req.write('x'.repeat(16))
      req.end('x'.repeat(17))
    })
    expect(status).toBe(413)
  })
})
