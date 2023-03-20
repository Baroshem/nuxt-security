import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Basic Auth', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basicAuth', import.meta.url)),
  })

  it ('should return 401 Access denied when not passing credentials', async () => {
    const res = await fetch('/')
    console.log(res)

    expect(res.status).toBe(401)
    expect(res.statusText).toBe('Access denied')
  })
})
