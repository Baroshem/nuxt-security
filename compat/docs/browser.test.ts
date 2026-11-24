import { beforeAll, afterAll, expect, it } from 'vitest'
import { resolve } from 'node:path'
import { chromium, type Browser } from '@playwright/test'
import { startBuiltApp } from '../helpers'

let app: Awaited<ReturnType<typeof startBuiltApp>>
let browser: Browser
beforeAll(async () => {
  app = await startBuiltApp(resolve('docs/.output/server/index.mjs'))
  browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) })
})
afterAll(async () => { await browser?.close(); app?.close() })
it('renders migrated documentation, navigates and exposes searchable sections', async () => {
  const page = await browser.newPage()
  page.setDefaultTimeout(8000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto(`${app.url}/getting-started/installation`, { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(200)
  await expect.poll(() => page.locator('h1').first().textContent()).toMatch(/Installation/i)
  const group = page.getByRole('button', { name: /Middleware/i }).first()
  if (await group.count()) await group.click()
  const link = page.locator('a[href="/middleware/rate-limiter"]').first()
  await link.click()
  await expect.poll(() => page.locator('h1').first().textContent()).toMatch(/Rate Limiter/i)
  expect(await page.getByRole('link', { name: 'Edit this page' }).getAttribute('href')).toMatch(/1\.rate-limiter\.md$/)
  const sections = await fetch(`${app.url}/api/search.json`).then(res => res.json())
  expect(sections.length).toBeGreaterThan(10)
  expect(sections.some((section: { title: string }) => /Rate Limiter/i.test(section.title))).toBe(true)
  expect(errors).toEqual([])
  await page.close()
})
