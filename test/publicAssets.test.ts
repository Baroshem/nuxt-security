import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Public Assets', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/publicAssets', import.meta.url)),
  })

  it('does not set all-resources security headers when disabled in config', async () => {
    const { headers } = await fetch('/icon.png')
    expect(headers).toBeDefined()
    
    // Security headers that are always set on all resources
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')

    expect(rp).toBeNull()
    expect(sts).toBeNull()
    expect(xcto).toBeNull()
    expect(xdo).toBeNull()
    expect(xfo).toBeNull()
    expect(xpcdp).toBeNull()
    expect(xxp).toBeNull()
  })
  
  it('sets security headers on routes when specified in routeRules', async () => {
    const { headers } = await fetch('/test')
    expect(headers).toBeDefined()
    
    // Security headers that are always set on all resources
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')

    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
  })
})
