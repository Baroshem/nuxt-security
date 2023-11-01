import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Basic Auth', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basicAuth', import.meta.url)),
  })

  it ('should return 401 Access denied when not passing credentials', async () => {
    const res = await fetch('/')

    expect(res.status).toBe(401)
    expect(res.statusText).toBe('Access denied')
  })

  it ('should return 200 status code for excluded route', async () => {
    const res = await fetch('/api/hello')

    expect(res.status).toBe(200)
  })

  it ('should return 401 status code for included route', async () => {
    const res = await fetch('/api/hello/world/nuxt')

    expect(res.status).toBe(401)
  })

  it ('should return 200 status code for multiple included route', async () => {
    const res = await fetch('/admin')

    expect(res.status).toBe(401)
  })

  it ('should return 200 status code for multiple excluded route', async () => {
    const res = await fetch('/content')

    expect(res.status).toBe(200)
  })

  it ('should return a 401 status code for any arbitrary path', async () => {
    const res = await fetch('/arbitrary')

    expect(res.status).toBe(401)
  })
})
