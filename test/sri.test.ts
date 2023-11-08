import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Subresource Integrity', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/sri', import.meta.url))
  })

  const expectedIntegrityAttributes = 7 // 6 links (entry, index, nuxt-link, error-404, vue, error-500), 1 script (entry)

  it('injects `integrity` on Nuxt root scripts', async () => {
    const res = await fetch('/')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes)
  })

  it('injects `integrity` on resources bundled from assets folder', async () => {
    const res = await fetch('/asset')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 1) // 7 for Nuxt, 1 image
  })


  it('injects `integrity` on links to public folder', async () => {
    const res = await fetch('/public')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 2) // 7 for Nuxt, 2 images
  })

  it('does not modify `integrity` attributes when manually provided', async () => {
    const res = await fetch('/external')

    const text = await res.text()
    const elementsWithIntegrity = text.match(/ integrity="sha384-/g)?.length ?? 0

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 2) // 7 for Nuxt, 2 Bootstrap (script + css)
  })
})
