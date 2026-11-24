import { describe, expect, it } from 'vitest'
import { normalizeCloudflareHeaders } from '../src/utils/cloudflareHeaders'

describe('Cloudflare static header overrides / Cloudflare 靜態標頭覆寫', () => {
  it('orders general rules before exact rules and detaches conflicting values', () => {
    const output = normalizeCloudflareHeaders('/test.svg\n  X-Frame-Options: DENY\n/*\n  X-Frame-Options: SAMEORIGIN\n')
    expect(output.indexOf('/*')).toBeLessThan(output.indexOf('/test.svg'))
    const headers = new Headers()
    for (const line of output.split('\n').filter(line => line.startsWith('  '))) {
      if (line.startsWith('  ! ')) headers.delete(line.slice(4))
      else { const colon = line.indexOf(':'); headers.append(line.slice(2, colon), line.slice(colon + 1).trim()) }
    }
    expect(headers.get('x-frame-options')).toBe('DENY')
  })
  it('fails before shipping rules that Cloudflare would silently ignore', () => {
    expect(() => normalizeCloudflareHeaders(Array.from({ length: 101 }, (_, i) => `/page${i}\n  x-test: safe`).join('\n'))).toThrow('100 rules')
    expect(() => normalizeCloudflareHeaders('/\n  Content-Security-Policy: ' + 'a'.repeat(2000))).toThrow('2000 characters')
  })
})
