import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Allowed Methods', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/allowedMethods', import.meta.url)),
  })

  it ('should return 405 Method not allowed when using not allowed HTTP Method', async () => {
    const res = await fetch('/')

    expect(res.status).toBe(405)
    expect(res.statusText).toBe('Method not allowed')
  })

  it ('should return 200 OK when using allowed HTTP Method on route', async () => {
    const res = await fetch('/test')

    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})
