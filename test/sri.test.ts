import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Subresource Integrity', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/sri', import.meta.url)),
  })

  const expectedIntegrityAttributes = 4 // 3 links (entry, index, build meta), 1 script (entry)

  it('injects `integrity` on Nuxt root scripts', async () => {
    const res = await fetch('/')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 1) // + nuxt-link
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
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 1) // + 1 image
  })


  it('injects `integrity` on links to public folder', async () => {
    const res = await fetch('/public')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 1) // + 1 image
  })

  it('hashes public assets after they are finalized in `rollup:before`', async () => {
    const res = await fetch('/late-asset')
    const text = await res.text()
    const expected = createHash('sha384').update('final asset contents').digest('base64')

    expect(text).toContain(`integrity="sha384-${expected}"`)
  })

  it('does not modify `integrity` attributes when manually provided', async () => {
    const res = await fetch('/external')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 2) // + 2 Bootstrap
  })
})
