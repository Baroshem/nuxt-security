import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { rm } from 'node:fs/promises'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Storage options', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/storageOptions', import.meta.url)),
  })

  const dbPath = './test/fixtures/storageOptions/.nuxt/test/.data/db'
  await rm(dbPath, { recursive: true, force: true })

  it('should pass options to a custom driver', async () => {
    const res1 = await fetch('/')
    const res2 = await fetch('/')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res2.status).toBe(200)
    expect(res2.statusText).toBe('OK')
  })

  it('should return 429 with the custom driver', async () => {
    const res1 = await fetch('/')
    await fetch('/')
    await fetch('/')
    await fetch('/')
    const res5 = await fetch('/')

    expect(res1).toBeDefined()
    expect(res1).toBeTruthy()
    expect(res5.status).toBe(429)
    expect(res5.statusText).toBe('Too Many Requests')
  })
})
