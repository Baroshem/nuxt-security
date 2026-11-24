import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('dual policy, extensions and dynamic prerender / 雙政策、副檔名與動態預渲染', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/features', import.meta.url)) })
  it('serves enforced and report-only policies with the same nonce', async () => {
    const res = await fetch('/')
    expect(res.status).toBe(200)
    const policy = res.headers.get('content-security-policy')!
    const report = res.headers.get('content-security-policy-report-only')!
    const nonce = policy.match(/'nonce-([^']+)'/)?.[1]
    expect(nonce).toBeTruthy()
    expect(report).toContain(`'nonce-${nonce}'`)
    expect(report).toContain('report-uri /reports;')
    expect(policy).not.toContain('report-uri')
  })
  it('serves prerendered HTML with fresh nonces and no cacheable CSP meta', async () => {
    const first = await fetch('/static')
    const second = await fetch('/static')
    expect(first.status).toBe(200)
    expect(first.headers.get('cache-control')).toContain('no-store')
    const nonce = first.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]
    expect(nonce).toBeTruthy()
    expect(second.headers.get('content-security-policy')).not.toBe(first.headers.get('content-security-policy'))
    const html = await first.text()
    expect(html).toContain('Dynamic static nonce')
    expect(html).not.toContain('http-equiv="Content-Security-Policy"')
    for (const tag of html.match(/<script\b[^>]*>/g) || []) expect(tag).toContain(`nonce="${nonce}"`)
  })
  it('protects a public SVG and keeps query matching consistent', async () => {
    const res = await fetch('/test.svg?download=1')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-security-policy')).toContain("default-src 'none';")
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })
})
