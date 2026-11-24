import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Vercel output contract / Vercel 輸出契約', () => {
  it('exports HTML CSP hashes rather than payload headers and retains ISR payload routes', () => {
    const config = JSON.parse(readFileSync('compat/deployments/.vercel/output/config.json', 'utf8'))
    const page = config.routes.find((route: { src: string }) => route.src === '/')
    const headers = Object.fromEntries(Object.entries(page.headers).map(([name, value]) => [name.toLowerCase(), value]))
    expect(headers['content-security-policy']).toContain('sha256-')
    expect(headers['content-type']).toContain('text/html')
    expect(headers['x-powered-by']).toBeUndefined()
    expect(existsSync('compat/deployments/.vercel/output/functions/isr/_payload.json-isr.prerender-config.json')).toBe(true)
  })
})
