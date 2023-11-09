import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils'

describe('[nuxt-security] Demo', async () => {
  const appPath = fileURLToPath(new URL('../docs', import.meta.url))
  const configPath = fileURLToPath(new URL('./fixtures/demo/nuxt.config.ts', import.meta.url))
  console.log('appPeth', appPath)
  await setup({
    rootDir: appPath,
    configFile: configPath,
    browser: true
  })

  it('runs demo on docs', async () => {
    const page = await createPage('/')

    const element = page.getByText('🚀 Get Started')
    await element.first().click()

    const text = await page.content()

    expect(text).toBeDefined()

  })
})
