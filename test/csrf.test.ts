import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] CSRF Protection', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/csrf', import.meta.url)),
  })

  it('should return 403 Forbidden when making POST request without CSRF token to protected endpoint', async () => {
    const res = await fetch('/api/test-csrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    })

    expect(res.status).toBe(403)
  })

  it('should return 200 OK when making POST request to excluded endpoint (csurf: false)', async () => {
    const res = await fetch('/api/test-no-csrf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'excluded-data' }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toBe('Success! CSRF excluded endpoint accessed without token.')
    expect(data).toHaveProperty('timestamp')
    expect(data.data).toEqual({ test: 'excluded-data' })
  })
})
