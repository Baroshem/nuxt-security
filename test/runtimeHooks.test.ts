import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/runtimeHooks', import.meta.url))
})

describe('[nuxt-security] runtime hooks', () => {
  it('expect csp to be set to static values by a runtime hook', async () => {
    const res = await fetch('/static')
    expect(res.headers.get('Content-Security-Policy')).toMatchInlineSnapshot("\"base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors * weird-value.com; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'unsafe-inline' static-value.com; upgrade-insecure-requests;\"")
  })

  it('expect csp to be set to dynamically-fetched values by a runtime hook', async () => {
    const res = await fetch('/dynamic')
    expect(res.headers.get('Content-Security-Policy')).toMatchInlineSnapshot("\"base-uri 'none'; font-src 'self' https: data:; form-action 'self'; frame-ancestors * weird-value.com; img-src 'self' data:; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'unsafe-inline' *.dynamic-value.com; upgrade-insecure-requests;\"")
  })
})