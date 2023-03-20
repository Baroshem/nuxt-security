import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Rate Limiter', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/rateLimiter', import.meta.url)),
  })

  it ('should return 200 OK when not reaching the limit', async () => {
    const res1 = await fetch('/')
    const res2 = await fetch('/')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res2.status).toBe(200)
    expect(res2.statusText).toBe('OK')
  })

  it ('should return 429 Too Many Responses after limit reached', async () => {
    const res1 = await fetch('/')
    const res2 = await fetch('/')
    const res3 = await fetch('/')
    const res4 = await fetch('/')
    const res5 = await fetch('/')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(429)
    expect(res5.statusText).toBe('Too Many Requests')
  })
})
