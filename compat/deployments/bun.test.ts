import { afterAll, beforeAll, expect, it } from 'vitest'
import { resolve } from 'node:path'
import { startBuiltApp } from '../helpers'

let app: Awaited<ReturnType<typeof startBuiltApp>>
beforeAll(async () => { app = await startBuiltApp(resolve('compat/deployments/.output-bun/server/index.mjs'), {}, process.env.BUN_BIN || 'bun') })
afterAll(() => app?.close())
it('serves Bun SSR with matching nonce and prerendered hash policies / Bun SSR 與 SSG', async () => {
  const response = await fetch(`${app.url}/isr`)
  expect(response.status).toBe(200)
  const nonce = response.headers.get('content-security-policy')?.match(/'nonce-([^']+)'/)?.[1]
  expect(nonce).toBeTruthy()
  for (const tag of (await response.text()).match(/<script\b[^>]*>/g) || []) expect(tag).toContain(`nonce="${nonce}"`)
  const page = await fetch(app.url)
  expect(page.status).toBe(200)
  expect(page.headers.get('content-security-policy')).toContain('sha256-')
})
