import { describe, it, expect, beforeEach } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Headers', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })
  let res: Response 

  it ('fetches the homepage', async () => {
    res = await fetch('/')

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
  })

  it('has `x-xss-protection` header set with correct default value for certain route', async () => {
    const { headers } = await fetch('/test')

    expect(headers.has('x-xss-protection')).toBeTruthy()

    const xxpHeaderValue = headers.get('x-xss-protection')

    expect(xxpHeaderValue).toBeTruthy()
    expect(xxpHeaderValue).toBe('1')
  })

  it('has `content-security-policy` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('content-security-policy')).toBeTruthy()

    const cspHeaderValue = headers.get('content-security-policy')
    const nonceValue = cspHeaderValue?.match(/'nonce-(.*?)'/)?.[1]

    expect(cspHeaderValue).toBeTruthy()
    expect(nonceValue).toBeDefined()
    expect(nonceValue).toHaveLength(24)
    expect(cspHeaderValue).toBe(`base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic' 'nonce-${nonceValue}'; upgrade-insecure-requests`)
  })

  it('has `cross-origin-embedder-policy` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('cross-origin-embedder-policy')).toBeTruthy()

    const coepHeaderValue = headers.get('cross-origin-embedder-policy')

    expect(coepHeaderValue).toBeTruthy()
    expect(coepHeaderValue).toBe('require-corp')
  })

  it('has `cross-origin-opener-policy` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('cross-origin-opener-policy')).toBeTruthy()

    const coopHeaderValue = headers.get('cross-origin-opener-policy')

    expect(coopHeaderValue).toBeTruthy()
    expect(coopHeaderValue).toBe('same-origin')
  })

  it('has `cross-origin-resource-policy` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('cross-origin-resource-policy')).toBeTruthy()

    const corpHeaderValue = headers.get('cross-origin-resource-policy')

    expect(corpHeaderValue).toBeTruthy()
    expect(corpHeaderValue).toBe('same-origin')
  })

  it('has `origin-agent-cluster` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('origin-agent-cluster')).toBeTruthy()

    const oacHeaderValue = headers.get('origin-agent-cluster')

    expect(oacHeaderValue).toBeTruthy()
    expect(oacHeaderValue).toBe('?1')
  })

  it('has `permissions-policy` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('permissions-policy')).toBeTruthy()

    const ppHeaderValue = headers.get('permissions-policy')

    expect(ppHeaderValue).toBeTruthy()
    expect(ppHeaderValue).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')
  })

  it('has `referrer-policy` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('referrer-policy')).toBeTruthy()

    const rpHeaderValue = headers.get('referrer-policy')

    expect(rpHeaderValue).toBeTruthy()
    expect(rpHeaderValue).toBe('no-referrer')
  })

  it('has `strict-transport-security` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('strict-transport-security')).toBeTruthy()

    const stsHeaderValue = headers.get('strict-transport-security')

    expect(stsHeaderValue).toBeTruthy()
    expect(stsHeaderValue).toBe('max-age=15552000; includeSubDomains')
  })

  it('has `x-content-type-options` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('x-content-type-options')).toBeTruthy()

    const xctpHeaderValue = headers.get('x-content-type-options')

    expect(xctpHeaderValue).toBeTruthy()
    expect(xctpHeaderValue).toBe('nosniff')
  })

  it('has `x-dns-prefetch-control` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('x-dns-prefetch-control')).toBeTruthy()

    const xdpcHeaderValue = headers.get('x-dns-prefetch-control')

    expect(xdpcHeaderValue).toBeTruthy()
    expect(xdpcHeaderValue).toBe('off')
  })

  it('has `x-download-options` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('x-download-options')).toBeTruthy()

    const xdoHeaderValue = headers.get('x-download-options')

    expect(xdoHeaderValue).toBeTruthy()
    expect(xdoHeaderValue).toBe('noopen')
  })

  it('has `x-frame-options` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('x-frame-options')).toBeTruthy()

    const xfoHeaderValue = headers.get('x-frame-options')

    expect(xfoHeaderValue).toBeTruthy()
    expect(xfoHeaderValue).toBe('SAMEORIGIN')
  })

  it('has `x-permitted-cross-domain-policies` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('x-permitted-cross-domain-policies')).toBeTruthy()

    const xpcdpHeaderValue = headers.get('x-permitted-cross-domain-policies')

    expect(xpcdpHeaderValue).toBeTruthy()
    expect(xpcdpHeaderValue).toBe('none')
  })

  it('has `x-xss-protection` header set with correct default value', async () => {
    const { headers } = res

    expect(headers.has('x-xss-protection')).toBeTruthy()

    const xxpHeaderValue = headers.get('x-xss-protection')

    expect(xxpHeaderValue).toBeTruthy()
    expect(xxpHeaderValue).toBe('0')
  })
})
