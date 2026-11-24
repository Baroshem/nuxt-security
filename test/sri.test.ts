import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Subresource Integrity', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/sri', import.meta.url)),
  })

  function expectIntegrity(text: string) {
    const tags = text.match(/<(?:script|link)\b[^>]*>/gi) ?? []
    const supported = tags.filter(tag => /<script\b/.test(tag) && / src=/.test(tag)
      || / rel="(?:stylesheet|preload|modulepreload)"/.test(tag) && / href="[^"?]+\.(?:js|css|png)"/.test(tag))
    expect(supported.length).toBeGreaterThan(0)
    for (const tag of supported) expect(tag).toMatch(/ integrity="sha384-[^"]+"/)
  }

  it('injects `integrity` on Nuxt root scripts', async () => {
    const res = await fetch('/')

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expectIntegrity(text)
  })

  it.each(['/', '/asset', '/public'])('hashes served scripts and styles on %s with an entry import map', async (route) => {
    const res = await fetch(route)
    const text = await res.text()
    const importMap = text.match(/<script[^>]*type="importmap"[^>]*>([\s\S]*?)<\/script>/)
    expect(importMap).not.toBeNull()
    expect(JSON.parse(importMap![1]).imports['#entry']).toBeTruthy()

    const tags = text.match(/<(?:script|link)\b[^>]*>/g) ?? []
    let scriptsChecked = 0
    let stylesChecked = 0
    for (const tag of tags) {
      if (tag.startsWith('<link') && !/ rel="(?:stylesheet|preload|modulepreload)"/.test(tag)) continue
      const url = tag.match(/\b(?:src|href)="([^"]+)"/)?.[1]
      const integrity = tag.match(/\bintegrity="([^"]+)"/)?.[1]
      // SRI enforcement for the entry import map concerns scripts and styles.
      // Do not include JSON build metadata or image preload links here.
      if (!url?.endsWith('.js') && !url?.endsWith('.css')) {
        continue
      }
      expect(url).toMatch(/^\/(?!\/)/)
      const asset = await fetch(url!)
      expect(asset.status).toBe(200)
      const digest = createHash('sha384').update(Buffer.from(await asset.arrayBuffer())).digest('base64')
      expect(integrity, url).toBe(`sha384-${digest}`)
      if (url!.endsWith('.js')) {
        scriptsChecked++
      } else {
        stylesChecked++
      }
    }
    expect(scriptsChecked).toBeGreaterThan(0)
    if (route === '/asset') {
      expect(stylesChecked).toBeGreaterThan(0)
    }
  })

  it('injects `integrity` on resources bundled from assets folder', async () => {
    const res = await fetch('/asset')

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expectIntegrity(text)
  })


  it('injects `integrity` on links to public folder', async () => {
    const res = await fetch('/public')

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expectIntegrity(text)
  })

  it('hashes the final public asset contents', async () => {
    const text = await fetch('/late-asset').then(res => res.text())
    const expected = createHash('sha384').update('final asset contents').digest('base64')
    expect(text).toContain(`integrity="sha384-${expected}"`)
  })

  it('does not modify `integrity` attributes when manually provided', async () => {
    const res = await fetch('/external')

    const text = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expectIntegrity(text)
  })
})
