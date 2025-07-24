import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Subresource Integrity with cdnURL', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/sri', import.meta.url)),
    nuxtConfig: {
      app: {
        cdnURL: 'https://cdn.example.com'
      }
    }
  })

  const expectedIntegrityAttributes = 3 // 2 links (entry, index), 1 script (entry)

  it('correctly handles resources with cdnUrl when applying integrity hashes', async () => {
    // Test the home page which should have script and link tags
    const res = await fetch('/')
    const text = await res.text()

    // Verify that the response is valid
    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(text).toBeDefined()

    const elementsWithIntegrity = text.match(/<(script|link)[^>]*\s+integrity="sha384-[^"]*"[^>]*>/g) ?? [];

    // Check that urls are correctly prefixed with the cdnURL
    for (const element of elementsWithIntegrity) {
      const urlMatch = element.match(/\s(?:src|href)="([^"]+)"/);
      const url = urlMatch?.[1];

      expect(url).toBeDefined();
      expect(url).toMatch(/^https:\/\/cdn\.example\.com/);
    }

    // Check the number of elements with integrity attributes
    expect(elementsWithIntegrity.length).toBe(expectedIntegrityAttributes + 1); // + nuxt-link

  })
})
