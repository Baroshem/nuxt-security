import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { Miniflare } from 'miniflare'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

let mf: Miniflare
beforeAll(() => {
  mf = new Miniflare({ name: 'security', modules: true, scriptPath: resolve('compat/deployments/.output/server/index.mjs'), modulesRoot: resolve('compat/deployments/.output/server'), modulesRules: [{ type: 'ESModule', include: ['**/*.mjs'] }], compatibilityDate: '2026-07-30', compatibilityFlags: ['nodejs_compat'], serviceBindings: { ASSETS: async () => new Response('missing', { status: 404 }) } })
})
afterAll(async () => { await mf?.dispose() })
describe('Cloudflare worker deployment / Cloudflare worker 部署', () => {
  it('serves SSR through workerd with fresh matching nonce headers', async () => {
    const first = await mf.dispatchFetch('https://example.com/isr')
    if (first.status !== 200) console.log("worker error", (await first.clone().text()).slice(0, 2000))
    expect(first.status).toBe(200)
    const nonce = first.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]
    expect(nonce).toBeTruthy()
    const html = await first.text()
    expect(html).toContain('ISR deployment')
    for (const tag of html.match(/<script\b[^>]*>/g) || []) expect(tag).toContain(`nonce="${nonce}"`)
  })
  it('exports CSP hashes and extension rules in static headers', () => {
    const headers = readFileSync('compat/deployments/.output/public/_headers', 'utf8')
    expect(headers).toContain('sha256-')
    expect(headers).toContain("default-src 'none';")
    expect(headers).not.toContain('{{nonce}}')
  })
})
