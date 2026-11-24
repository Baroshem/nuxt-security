import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('streamed SSR nonce / 串流 SSR nonce', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/ssrNonce', import.meta.url)), nuxtConfig: { experimental: { ssrStreaming: true } } })
  it('nonces hydration/config/streaming bootstrap tags and renews the nonce', async () => {
    const res = await fetch('/')
    const nonce = res.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]
    expect(nonce).toBeTruthy()
    const html = await res.text()
    expect(html).toContain('__NUXT_DATA__')
    const scripts = html.match(/<script\b[^>]*>/g) || []
    expect(scripts.length).toBeGreaterThan(2)
    for (const script of scripts) expect(script).toContain(`nonce="${nonce}"`)
    expect((await fetch('/')).headers.get('content-security-policy')).not.toBe(res.headers.get('content-security-policy'))
  })
})
