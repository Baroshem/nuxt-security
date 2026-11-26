import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setup, useTestContext } from '@nuxt/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

describe('[nuxt-security] SRI with relative asset URLs', async () => {
  beforeAll(() => {
    vi.stubEnv('NUXT_APP_BASE_URL', './')
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/sriRelative', import.meta.url)),
    server: false,
    nuxtConfig: { _generate: true, nitro: { static: true } },
  })

  it.each(['index.html', '200.html', '404.html'])('adds integrity and CSP hashes to %s', async (page) => {
    const output = join(useTestContext().nuxt!.options.buildDir, 'output/public')
    const html = await readFile(join(output, page), 'utf8')
    const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/i)?.[1]
    const assets = [
      html.match(/<script\b[^>]*\ssrc="(\.\/_nuxt\/[^/"]+\.js)"[^>]*>/),
      html.match(/<link\b[^>]*\shref="(\.\/_nuxt\/[^/"]+\.css)"[^>]*>/),
    ]

    for (const asset of assets) {
      expect(asset).not.toBeNull()
      const [tag, url] = asset!
      const content = await readFile(join(output, url))
      const digest = createHash('sha384').update(content).digest('base64')
      expect(tag).toContain(`integrity="sha384-${digest}"`)
      expect(csp).toContain(`'sha384-${digest}'`)
    }
  })
})
