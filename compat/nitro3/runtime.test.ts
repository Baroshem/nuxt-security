import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { resolve } from 'node:path'
import { startBuiltApp } from '../helpers'

let app: Awaited<ReturnType<typeof startBuiltApp>>
beforeAll(async () => { app = await startBuiltApp(resolve('compat/nitro3/.output/server/index.mjs')) })
afterAll(() => { app?.close() })
describe('native Nitro 3 without compatibility imports / 原生 Nitro 3', () => {
  it('serves a streamed SSR page with matching CSP nonces on every script', async () => {
    const res = await fetch(app.url)
    expect(res.status).toBe(200)
    const nonce = res.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]
    expect(nonce).toBeTruthy()
    const html = await res.text()
    expect(html).toContain('Nitro 3 security')
    const scripts = html.match(/<script\b[^>]*>/g) || []
    expect(scripts.length).toBeGreaterThan(1)
    for (const script of scripts) expect(script).toContain(`nonce="${nonce}"`)
    const again = await fetch(app.url)
    expect(again.headers.get('content-security-policy')).not.toBe(res.headers.get('content-security-policy'))
  })
  it('preserves static headers and hashes', async () => {
    const res = await fetch(`${app.url}/static`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-security-policy')).toContain('sha256-')
    expect(res.headers.get('content-security-policy')).not.toContain('{{nonce}}')
  })
  it('preserves bodies downstream and rejects XSS', async () => {
    const request = (body: unknown) => fetch(`${app.url}/api/echo`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    const safe = { message: '<a href="https://example.com">safe</a>' }
    expect(await (await request(safe)).json()).toEqual(safe)
    expect((await request({ value: '<script>alert(1)</script>' })).status).toBe(400)
  })
  it('protects native h3 v2 CSRF requests and accepts a valid cookie/token pair', async () => {
    expect((await fetch(`${app.url}/api/csrf`, { method: 'POST', body: '{}' })).status).toBe(403)
    const page = await fetch(app.url)
    const token = (await page.text()).match(/name="csrf-token" content="([^"]+)"/)?.[1]
    const cookies = page.headers.getSetCookie().map(cookie => cookie.split(';')[0]).join('; ')
    expect(token).toBeTruthy()
    expect(cookies).toContain('csrf=')
    const valid = await fetch(`${app.url}/api/csrf`, { method: 'POST', headers: { cookie: cookies, 'csrf-token': token!, 'content-type': 'application/json' }, body: '{"safe":true}' })
    expect(valid.status).toBe(200)
    expect(await valid.json()).toEqual({ safe: true })
  })
})
