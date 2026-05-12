import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Basic Auth – secure default', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basicAuthSecureDefault', import.meta.url)),
  })

  it('should require auth on / by default', async () => {
    const res = await fetch('/')
    expect(res.status).toBe(401)
  })

  it('should require auth on /any-path by default', async () => {
    const res = await fetch('/any-path')
    expect(res.status).toBe(401)
  })

  it('should require auth on /api/hello by default', async () => {
    const res = await fetch('/api/hello')
    expect(res.status).toBe(401)
  })
})
