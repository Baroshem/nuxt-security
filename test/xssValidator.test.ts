import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Cross Site Scripting', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/xss', import.meta.url))
  })

  it('should return 400 Bad Request when passing a script in query or body', async () => {
    const res = await fetch('/?test=<script>alert(1)</script>')

    expect(res.status).toBe(400)
    expect(res.statusText).toBe('Bad Request')
  })

  it('should NOT bypass XSS filtering when statusMessage param is present', async () => {
    const res = await fetch('/?statusMessage=foo&test=<script>alert(1)</script>')
    expect(res.status).toBe(400)
    expect(res.statusText).toBe('Bad Request')
  })

  it('should return 200 OK when passing a script in query or body for certain route', async () => {
    const res = await fetch('/test?text=<script>alert(1)</script>')

    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  it('should return 200 OK when passing formdata properly', async () => {
    const formData = new FormData()
    formData.append('field1', 'value1')
    formData.append('field2', 'value2')

    const res = await fetch('/', {
      method: 'POST',
      body: formData
    })
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  it('accepts allowed rich-text JSON and preserves it for the API', async () => {
    const body = { content: '<a href="https://example.com">link</a>' }
    const res = await fetch('/api/echo', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(body)
  })

  it('does not let a user-supplied Bad Request statusMessage bypass validation', async () => {
    const res = await fetch('/api/echo', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ statusMessage: 'Bad Request', content: '<script>alert(1)</script>' })
    })
    expect(res.status).toBe(400)
  })
})
