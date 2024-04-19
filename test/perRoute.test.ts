import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Per-route Configuration', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/perRoute', import.meta.url)),
  })

  it('sets default headers for the homepage', async () => {
    const { headers } = await fetch('/')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBe('same-origin')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('sets default security headers for a page', async () => {
    const { headers } = await fetch('/set-global')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBe('same-origin')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('sets default security headers recursively', async () => {
    const { headers } = await fetch('/set-global/deep/page')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBe('same-origin')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('does not set security headers when false', async () => {
    const { headers } = await fetch('/ignore-all')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBeNull()
    expect(coop).toBeNull()
    expect(coep).toBeNull()
    expect(csp).toBeNull()
    expect(oac).toBeNull()
    expect(rp).toBe('no-referrer-when-downgrade')
    expect(sts).toBeNull()
    expect(xcto).toBeNull()
    expect(xdpc).toBeNull()
    expect(xdo).toBeNull()
    expect(xfo).toBeNull()
    expect(xpcdp).toBeNull()
    expect(xxp).toBeNull()
    expect(pp).toBeNull()

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('does not set security headers recursively when false', async () => {
    const { headers } = await fetch('/ignore-all/deep/page')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBeNull()
    expect(coop).toBeNull()
    expect(coep).toBeNull()
    expect(csp).toBeNull()
    expect(oac).toBeNull()
    expect(rp).toBe('no-referrer-when-downgrade')
    expect(sts).toBeNull()
    expect(xcto).toBeNull()
    expect(xdpc).toBeNull()
    expect(xdo).toBeNull()
    expect(xfo).toBeNull()
    expect(xpcdp).toBeNull()
    expect(xxp).toBeNull()
    expect(pp).toBeNull()

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('sets a specific security header for a page', async () => {
    const { headers } = await fetch('/set-specific')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBe('same-origin-allow-popups')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('sets a specific security header recursively', async () => {
    const { headers } = await fetch('/set-specific/deep/page')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBe('same-origin-allow-popups')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('does not set a specific security header when false', async () => {
    const { headers } = await fetch('/ignore-specific')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBeNull()
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBeNull()
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('does not set a specific security header recursively when false', async () => {
    const { headers } = await fetch('/ignore-specific/deep/page')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBeNull()
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBeNull()
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('merges security headers for a page', async () => {
    const { headers } = await fetch('/merge-recursive')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBeNull()
    expect(coop).toBe('same-origin')
    expect(coep).toBe('credentialless')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('merges security headers recursively', async () => {
    const { headers } = await fetch('/merge-recursive/deep/page')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-site')
    expect(coop).toBeNull()
    expect(coep).toBe('credentialless')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=15552000; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('finds security headers provided as standard headers', async () => {
    const { headers } = await fetch('/provided-as-standard')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('cross-origin')
    expect(coop).toBe('same-origin')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https:; upgrade-insecure-requests; media-src 'none';")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=1; includeSubDomains; preload;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(self), display-capture=(), fullscreen=*, geolocation=(), microphone=()')

    const foo = headers.get('foo')
    const foo2 = headers.get('foo2')
    expect(foo).toBe('baz')
    expect(foo2).toBe('baz2')
  })

  it('resolves conflicts between standard and security headers by giving priority to security', async () => {
    const { headers } = await fetch('/resolve-conflict')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-site')
    expect(coop).toBeNull()
    expect(coep).toBe('credentialless')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=2;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(self), display-capture=(), fullscreen=(self), geolocation=(*), microphone=()')

    const foo = headers.get('foo')
    const foo2 = headers.get('foo2')
    expect(foo).toBe('baz')
    expect(foo2).toBe('baz2')
  })

  it('resolves conflicts between standard and security headers recursively', async () => {
    const { headers } = await fetch('/resolve-conflict/deep/page')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-site')
    expect(coop).toBe('same-origin-allow-popups')
    expect(coep).toBe('credentialless')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer-when-downgrade')
    expect(sts).toBe('max-age=1; preload;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('DENY')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(self), display-capture=(), fullscreen=(self), geolocation=(*), microphone=()')

    const foo = headers.get('foo')
    const foo2 = headers.get('foo2')
    expect(foo).toBe('baz')
    expect(foo2).toBe('baz2')
  })


  it('is backwards-compatible with deprecated object syntax for standard headers', async () => {
    const { headers } = await fetch('/support-deprecated-object')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBeNull()
    expect(coop).toBe('same-origin')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src https:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self'; upgrade-insecure-requests;")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=10; preload;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('is backwards-compatible with deprecated string syntax for security headers', async () => {
    const { headers } = await fetch('/support-deprecated-string')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBe('same-origin')
    expect(coop).toBe('same-origin')
    expect(coep).toBe('require-corp')
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self'; upgrade-insecure-requests; manifest-src 'none';")
    expect(oac).toBe('?1')
    expect(rp).toBe('no-referrer')
    expect(sts).toBe('max-age=10; includeSubDomains;')
    expect(xcto).toBe('nosniff')
    expect(xdpc).toBe('off')
    expect(xdo).toBe('noopen')
    expect(xfo).toBe('SAMEORIGIN')
    expect(xpcdp).toBe('none')
    expect(xxp).toBe('0')
    expect(pp).toBe('camera=(), display-capture=(), fullscreen=(), geolocation=(), microphone=()')

    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('supports the empty string syntax as a removal flag', async () => {
    const { headers } = await fetch('/empty-string-remove')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coep = headers.get('cross-origin-embedder-policy')

    expect(corp).toBeNull()
    expect(coep).toBeNull()
  })

  // DEPRECATED
  /*
  it('supports concatenation merging via the array syntax', async () => {
    const { headers } = await fetch('/merge-concatenate-array/deep/page')
    expect(headers).toBeDefined()

    const csp = headers.get('content-security-policy')
    const pp = headers.get('permissions-policy')

    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src blob: https: 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(pp).toBe('camera=(), display-capture=(https://* self), fullscreen=(), geolocation=(), microphone=()')
  })
  */

  it('supports substitution merging via the string syntax', async () => {
    const { headers } = await fetch('/merge-substitute-string/deep/page')
    expect(headers).toBeDefined()

    const csp = headers.get('content-security-policy')
    const pp = headers.get('permissions-policy')

    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src blob:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    expect(pp).toBe('camera=(), display-capture=self, fullscreen=(), geolocation=(), microphone=()')
  })

  it('does not set security headers for an API route', async () => {
    const { headers } = await fetch('/api/test')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBeNull()
    expect(coop).toBeNull()
    expect(coep).toBeNull()
    expect(csp).toBeNull()
    expect(oac).toBeNull()
    expect(rp).toBe('no-referrer-when-downgrade')
    expect(sts).toBeNull()
    expect(xcto).toBeNull()
    expect(xdpc).toBeNull()
    expect(xdo).toBeNull()
    expect(xfo).toBeNull()
    expect(xpcdp).toBeNull()
    expect(xxp).toBeNull()
    expect(pp).toBeNull()
  })

  it('does not set security headers for bundled assets', async () => {
    const res = await fetch('/')
    const text = await res.text()

    const head = text.match(/<head>(.*?)<\/head>/s)?.[1]
    expect(head).toBeDefined()

    const script = head!.match(/<script.*? src="(.*?)"/)?.[1]
    expect(script).toBeDefined()

    const { headers } = await fetch(script!)
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBeNull()
    expect(coop).toBeNull()
    expect(coep).toBeNull()
    expect(csp).toBeNull()
    expect(oac).toBeNull()
    expect(rp).toBe('no-referrer-when-downgrade')
    expect(sts).toBeNull()
    expect(xcto).toBeNull()
    expect(xdpc).toBeNull()
    expect(xdo).toBeNull()
    expect(xfo).toBeNull()
    expect(xpcdp).toBeNull()
    expect(xxp).toBeNull()
    expect(pp).toBeNull()
  })

  it('does not set security headers for public assets', async () => {
    const { headers } = await fetch('/icon.png')
    expect(headers).toBeDefined()

    const corp = headers.get('cross-origin-resource-policy')
    const coop = headers.get('cross-origin-opener-policy')
    const coep = headers.get('cross-origin-embedder-policy')
    const csp = headers.get('content-security-policy')
    const oac = headers.get('origin-agent-cluster')
    const rp = headers.get('referrer-policy')
    const sts = headers.get('strict-transport-security')
    const xcto = headers.get('x-content-type-options')
    const xdpc = headers.get('x-dns-prefetch-control')
    const xdo = headers.get('x-download-options')
    const xfo = headers.get('x-frame-options')
    const xpcdp = headers.get('x-permitted-cross-domain-policies')
    const xxp = headers.get('x-xss-protection')
    const pp = headers.get('permissions-policy')

    expect(corp).toBeNull()
    expect(coop).toBeNull()
    expect(coep).toBeNull()
    expect(csp).toBeNull()
    expect(oac).toBeNull()
    expect(rp).toBe('no-referrer-when-downgrade')
    expect(sts).toBeNull()
    expect(xcto).toBeNull()
    expect(xdpc).toBeNull()
    expect(xdo).toBeNull()
    expect(xfo).toBeNull()
    expect(xpcdp).toBeNull()
    expect(xxp).toBeNull()
    expect(pp).toBeNull()
  })

  it('preserves standard headers for an API route', async () => {
    const { headers } = await fetch('/api/test')
    expect(headers).toBeDefined()
    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('preserves standard headers for a bundled asset', async () => {
    const res = await fetch('/')
    const text = await res.text()

    const head = text.match(/<head>(.*?)<\/head>/s)?.[1]
    expect(head).toBeDefined()

    const script = head!.match(/<script.*? src="(.*?)"/)?.[1]
    expect(script).toBeDefined()

    const { headers } = await fetch(script!)
    expect(headers).toBeDefined()
    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('preserves standard headers for public assets', async () => {
    const { headers } = await fetch('/icon.png')
    expect(headers).toBeDefined()
    const foo = headers.get('foo')
    expect(foo).toBe('bar')
  })

  it('does not inject CSP nonces on a deeply disabled route', async () => {
    const res = await fetch('/csp-nonce/deep/disabled')
    const cspHeaderValue = res.headers.get('content-security-policy')
    expect (cspHeaderValue).toBeDefined()

    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)?.[1]
    expect(nonce).toBeUndefined()

    const text = await res.text()
    expect(text).toBeDefined()

    const elementsWithNonce = text.match(/nonce="(.*?)"/g)
    expect(elementsWithNonce).toBeNull()
  })

  it('injects CSP nonces on a deeply-enabled route', async () => {
    const res = await fetch('/csp-nonce/deep/enabled')
    const cspHeaderValue = res.headers.get('content-security-policy')
    expect (cspHeaderValue).toBeDefined()

    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)?.[1]
    expect(nonce).toBeDefined()

    const text = await res.text()
    expect(text).toBeDefined()

    const nonceMatch = `nonce="${nonce}"`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const elementsWithNonce = text.match(new RegExp(nonceMatch, 'g'))
    expect(elementsWithNonce).toHaveLength(8)
  })

  it('does not inject CSP hashes on a deeply-disabled route', async () => {
    const res = await fetch('/csp-hash/deep/disabled')
    // DISABLING THIS PART OF THE TEST AFTER PATCH #348 THAT REMOVES CSP SSG PRESETS
    /*
    const cspHeaderValue = res.headers.get('content-security-policy')
    expect(cspHeaderValue).toBeDefined()
    const headerHashes = cspHeaderValue!.match(/'sha256-(.*?)'/)
    expect(headerHashes).toBeNull()
    */

    const text = await res.text()
    const head = text.match(/<head>(.*?)<\/head>/s)?.[1]
    expect(head).toBeDefined()

    const content = head!.match(/<meta http-equiv="Content-Security-Policy" content="(.*?)">/)?.[1]
    expect(content).toBeDefined()
    const contentHashes = content!.match(/'sha256-(.*?)'/)
    expect(contentHashes).toBeNull()
  })

  it('injects CSP hashes on a deeply-enabled route', async () => {
    const res = await fetch('/csp-hash/deep/enabled')
    // DISABLING THIS PART OF THE TEST AFTER PATCH #348 THAT REMOVES CSP SSG PRESETS
    /*
    const cspHeaderValue = res.headers.get('content-security-policy')
    expect(cspHeaderValue).toBeDefined()
    const headerHashes = cspHeaderValue!.match(/'sha256-(.*?)'/)
    expect(headerHashes).toHaveLength(2)
    */

    const text = await res.text()
    const head = text.match(/<head>(.*?)<\/head>/s)?.[1]
    expect(head).toBeDefined()

    const content = head!.match(/<meta http-equiv="Content-Security-Policy" content="(.*?)">/)?.[1]
    expect(content).toBeDefined()

    const hashes = content!.match(/'sha256-(.*?)'/)
    expect(hashes).toHaveLength(2)
  })

  it('does not inject CSP meta on a deeply-disabled route', async () => {
    const res = await fetch('/csp-meta/deep/disabled')
    // DISABLING THIS PART OF THE TEST AFTER PATCH #348 THAT REMOVES CSP SSG PRESETS
    /*
    const cspHeaderValue = res.headers.get('content-security-policy')
    expect(cspHeaderValue).toBeDefined()
    */

    const text = await res.text()
    const head = text.match(/<head>(.*?)<\/head>/s)?.[1]
    expect(head).toBeDefined()

    const content = head!.match(
      /<meta http-equiv="Content-Security-Policy" content="(.*?)">/
    )?.[1]
    expect(content).toBeUndefined()
  })

  it('injects CSP meta on a deeply-enabled route', async () => {
    const res = await fetch('/csp-meta/deep/enabled')
    // DISABLING THIS PART OF THE TEST AFTER PATCH #348 THAT REMOVES CSP SSG PRESETS
    /*
    const cspHeaderValue = res.headers.get('content-security-policy')
    expect(cspHeaderValue).toBeDefined()
    */

    const text = await res.text()
    const head = text.match(/<head>(.*?)<\/head>/s)?.[1]
    expect(head).toBeDefined()

    const content = head!.match(
      /<meta http-equiv="Content-Security-Policy" content="(.*?)">/
    )?.[1]
    expect(content).toBeDefined()
  })

  it('does not inject SRI attributes on a deeply-disabled route', async () => {
    const res = await fetch('/sri-attribute/deep/disabled')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)

    expect(elementsWithIntegrity).toBeNull()
  })

  it('injects SRI attributes on a deeply-enabled route', async () => {
    const res = await fetch('/sri-attribute/deep/enabled')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)

    expect(elementsWithIntegrity).toHaveLength(3)
  })

  it ('does not overwrite middleware headers when false', async () => {
    const res = await fetch('/preserve-middleware')
    expect(res.status).toBe(200)

    const { headers } = res
    const csp = headers.get('content-security-policy')
    expect(csp).toBeDefined()
    expect(csp).toBe('example')
    const rp = headers.get('referrer-policy')
    expect(rp).toBeDefined()
    expect(rp).toBe('harder-example')
  })

  it ('overwrites middleware headers when not false', async () => {
    const res = await fetch('/preserve-middleware/deep/page')
    expect(res.status).toBe(200)

    const { headers } = res
    const csp = headers.get('content-security-policy')
    expect(csp).toBeDefined()
    expect(csp).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'strict-dynamic'; upgrade-insecure-requests;")
    const rp = headers.get('referrer-policy')
    expect(rp).toBeDefined()
    expect(rp).toBe('no-referrer')
  })

  it ('removes deprecated standard headers when false', async () => {
    const res = await fetch('/remove-deprecated')
    expect(res.status).toBe(200)

    const { headers } = res
    const csp = headers.get('content-security-policy')
    expect(csp).toBeDefined()
    expect(csp).toBeNull()
    const rp = headers.get('referrer-policy')
    expect(rp).toBeDefined()
    expect(rp).toBeNull()
  })

})


