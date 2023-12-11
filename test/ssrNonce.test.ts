import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Nonce', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssrNonce', import.meta.url))
  })

  const expectedNonceElements = 8 // 1 from app.vue/useHead, 6 for nuxt, 1 for plugin vue export helper

  it('injects `nonce` attribute in response', async () => {
    const res = await fetch('/')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)![1]

    const text = await res.text()
    const nonceMatch = `nonce="${nonce}"`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const elementsWithNonce = text.match(new RegExp(nonceMatch, 'g'))?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expect(elementsWithNonce).toBe(expectedNonceElements)
  })

  it('renews nonce even if mode is `check`', async () => {
    // Make sure a nonce exists by doing the initial request
    const originalRes = await fetch('/')
    const originalCsp = originalRes.headers.get('content-security-policy')
    const originalCookie = originalRes.headers.get('set-cookie')

    // Then simulate the second request from the page to the specified route
    const res = await fetch('/renew', { headers: { cookie: originalCookie } })

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(res.ok).toBe(true)
    expect(res.headers.get('content-security-policy')).not.toBe(originalCsp)
  })

  it('injects `nonce` attribute in response when using useHead composable', async () => {
    const res = await fetch('/use-head')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue!.match(/'nonce-(.*?)'/)![1]

    const text = await res.text()
    const nonceMatch = `nonce="${nonce}"`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const elementsWithNonce = text.match(new RegExp(nonceMatch, 'g'))?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expect(elementsWithNonce).toBe(expectedNonceElements + 1) // 1 extra for loader.js in useHead
  })

  it('removes the nonce from the CSP header when nonce is disabled', async () => {
    const res = await fetch('/disabled')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const noncesInCsp = cspHeaderValue?.match(/'nonce-(.*?)'/)?.length ?? 0

    expect(noncesInCsp).toBe(0)
    expect(cspHeaderValue).toBe("base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self'; script-src 'self' 'strict-dynamic'; upgrade-insecure-requests;")
  })

  it('injects `nonce` attribute in style tags', async () => {
    const res = await fetch('/with-styling')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)![1]

    const text = await res.text()
    const nonceMatch = `nonce="${nonce}"`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const elementsWithNonce = text.match(new RegExp(nonceMatch, 'g'))?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expect(elementsWithNonce).toBe(expectedNonceElements + 1) // one extra for the style tag
  })

  it('removes the nonces in pre-render mode', async () => {
    const res = await fetch('/prerendered')

    const body = await res.text()
    const injectedNonces = body.match(/ nonce="(.*?)"/)
    const meta = body.match(/<meta http-equiv="Content-Security-Policy" content="(.*?)"(.*?)>/)
    const content = meta?.[1]
    const cspNonces = content?.match(/'nonce-(.*?)'/)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(content).toBeDefined()
    expect(injectedNonces).toBe(null)
    expect(cspNonces).toBe(null)
  })
})
