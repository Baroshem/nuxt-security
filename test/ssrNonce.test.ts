import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Nonce', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssrNonce', import.meta.url))
  })

  function expectNonces(text: string, nonce: string | undefined) {
    const tags = text.match(/<(?:script|link|style)\b[^>]*>/gi) ?? []
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) expect(tag).toContain(`nonce="${nonce}"`)
  }

  it('injects `nonce` attribute in response', async () => {
    const res = await fetch('/')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)?.[1]

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expectNonces(text, nonce)
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
    const nonce = cspHeaderValue!.match(/'nonce-(.*?)'/)?.[1]

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expectNonces(text, nonce)
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
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)?.[1]

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expectNonces(text, nonce)
  })

  it('injects `nonce` attribute in every tag after a style with escaped quotes', async () => {
    const res = await fetch('/css-escaped-quotes')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)?.[1]

    const text = await res.text()
    const tags = text.match(/<(?:script|link|style)\b[^>]*>/g) ?? []
    const tagsWithoutNonce = tags.filter((tag) => !tag.includes(`nonce="${nonce}"`))

    expect(nonce).toBeDefined()
    expect(text).toMatch('image\\.svg\\"\\)')
    expect(tags.some((tag) => tag.startsWith('<script') && tag.includes('type="module"'))).toBe(true)
    expect(tagsWithoutNonce).toEqual([])
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

  /*it('does not modify custom elements', async () => {
    const res = await fetch('/with-custom-element')

    const body = /<scripter>/.test(await res.text())

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBe(true)
  })*/

  it('does not modify stringified elements', async () => {
    const res = await fetch('/string-script').then(res=>res.text())

    const body = res.match(/<div class="(.+)Hello/)
    const hasNonce = body[1].includes('nonce=')

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body[0]).toBeDefined()
    expect(hasNonce).toBe(false)
  })

  it('works with server-only components', async () => {
    const res = await fetch('/server-component')

    const cspHeaderValue = res.headers.get('content-security-policy')
    const nonce = cspHeaderValue?.match(/'nonce-(.*?)'/)?.[1]

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(nonce).toBeDefined()
    expect(text).toMatch(`<span id="server-nonce">${nonce}</span>`)
  })
  it('isolates parallel island renders and ignores HTTP nonce spoofing', async () => {
    const responses = await Promise.all([fetch('/server-component', { headers: { 'x-nuxt-security-nonce': 'attacker-controlled' } }), fetch('/server-component')])
    const nonces: string[] = []
    for (const response of responses) {
      const nonce = response.headers.get('content-security-policy')?.match(/'nonce-(.*?)'/)?.[1]
      expect(nonce).toBeTruthy()
      expect(nonce).not.toBe('attacker-controlled')
      expect(await response.text()).toContain(`<span id="server-nonce">${nonce}</span>`)
      nonces.push(nonce!)
    }
    expect(nonces[0]).not.toBe(nonces[1])
  })
})
