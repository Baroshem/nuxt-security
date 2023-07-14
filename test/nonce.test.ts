import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Nonce', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/nonce', import.meta.url))
  })

  it('injects `nonce` attribute in response', async () => {
    const res = await fetch('/')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)[1]

    const text = await res.text()
    const elementsWithNonce = text.match(new RegExp(`nonce="${nonce}"`, 'g'))?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expect(elementsWithNonce).toBe(9)
  })

  it('does not renew nonce if mode is `check`', async () => {
    // Make sure a nonce exists by doing the initial request
    const originalRes = await fetch('/')
    const originalCsp = originalRes.headers.get('content-security-policy')
    const originalCookie = originalRes.headers.get('set-cookie')

    // Then simulate the second request from the page to the specified route
    const res = await fetch('/api/generated-script', { headers: { cookie: originalCookie } })

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(res.ok).toBe(true)
    expect(res.headers.get('content-security-policy')).toBe(originalCsp)
  })

  it('injects `nonce` attribute in response when using useHead composable', async () => {
    const res = await fetch('/use-head')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)[1]

    const text = await res.text()
    const elementsWithNonce = text.match(new RegExp(`nonce="${nonce}"`, 'g'))?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expect(elementsWithNonce).toBe(11)
  })

  it('removes the nonce from the CSP header when nonce is disabled', async () => {
    const res = await fetch('/api/nonce-exempt')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const noncesInCsp = cspHeaderValue?.match(/'nonce-(.*?)'/)?.length ?? 0

    expect(noncesInCsp).toBe(0)
    expect(cspHeaderValue).toBe("base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'self'  'strict-dynamic'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests; script-src 'self'  'strict-dynamic'")
  })

  it('does not add nonce to literal strings', async () => {
    const res = await fetch('/')

    const text = await res.text()
    const untouchedLiteral = text.includes('var inlineLiteral = \'<script>console.log("example")</script>\'')

    expect(untouchedLiteral).toBe(true)
  })
})
