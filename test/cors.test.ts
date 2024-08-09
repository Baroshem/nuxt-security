import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] CORS', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/cors', import.meta.url)),
  })

  it ('should allow requests from serverUrl by default', async () => {
    const res = await fetch('/', { headers: { origin: 'http://localhost:3000' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
  })

  it ('should block requests from other origins by default', async () => {
    const res = await fetch('/', { headers: { origin: 'http://example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('should allow requests from all origins when * is set', async () => {
    let res = await fetch('/star', { headers: { origin: 'http://example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')

    res = await fetch('/star', { headers: { origin: 'http://a.b.c.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('should allow requests if origin matches', async () => {
    const res = await fetch('/single', { headers: { origin: 'https://example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
  })

  it('should block requests when origin does not match', async () => {
    const res = await fetch('/single', { headers: { origin: 'https://foo.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('should support multiple origins', async () => {
    let res = await fetch('/multi', { headers: { origin: 'https://a.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://a.example.com')

    res = await fetch('/multi', { headers: { origin: 'https://b.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://b.example.com')

    res = await fetch('/multi', { headers: { origin: 'https://c.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('should support regular expressions', async () => {
    let res = await fetch('/regexp-single', { headers: { origin: 'https://a.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://a.example.com')

    res = await fetch('/regexp-single', { headers: { origin: 'https://b.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://b.example.com')

    res = await fetch('/regexp-single', { headers: { origin: 'https://c.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('should support multiple regular expressions', async () => {
    let res = await fetch('/regexp-multi', { headers: { origin: 'https://a.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://a.example.com')

    res = await fetch('/regexp-multi', { headers: { origin: 'https://b.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://b.example.com')

    res = await fetch('/regexp-multi', { headers: { origin: 'https://c.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()

    res = await fetch('/regexp-multi', { headers: { origin: 'https://c.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()

    res = await fetch('/regexp-multi', { headers: { origin: 'https://foo.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()

    res = await fetch('/regexp-multi', { headers: { origin: 'https://1.foo.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://1.foo.example.com')

    res = await fetch('/regexp-multi', { headers: { origin: 'https://a.b.c.foo.example.com' } })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://a.b.c.foo.example.com')
  })
})
