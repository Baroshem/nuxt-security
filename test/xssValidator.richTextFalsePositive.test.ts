import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { fetch, setup } from '@nuxt/test-utils'

describe('[nuxt-security] XSS validator rich-text false positive', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/xssRichTextFalsePositive', import.meta.url)),
  })

  it('allows a rich-text-like JSON payload sent to POST endpoints', async () => {
    const res = await fetch('/api/rich-text', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        description: '<p style="text-align:center">hello</p>',
      }),
    })

    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})
