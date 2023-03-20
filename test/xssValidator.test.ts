import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Cross Site Scripting', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/xss', import.meta.url)),
  })

  it ('should return 400 Bad request when passing a script in query or body', async () => {
    const res = await fetch('/?test=<script>alert(1)</script>')

    expect(res.status).toBe(400)
    expect(res.statusText).toBe('Bad Request')
  })
})
