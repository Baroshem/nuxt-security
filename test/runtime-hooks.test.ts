import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

await setup({
    rootDir: fileURLToPath(new URL('./fixtures/runtime-hooks', import.meta.url))
})

describe('[nuxt-security] runtime hooks', () => {
    it('expect csp to be set by a runtime hook', async () => {
        const res = await fetch('/api/runtime-hooks')
        expect(await res.json()).toMatchInlineSnapshot(`
          {
            "csp": "script-src 'self' 'unsafe-inline' *.azure.com",
          }
        `)
        expect(res.headers.get('Content-Security-Policy')).toMatchInlineSnapshot( '"script-src \'self\' \'unsafe-inline\' *.azure.com"')
    })
})