import { describe, expect, it, vi } from 'vitest'
import { savePrerenderedHeaders } from '../src/utils/prerenderedHeaders'

describe('prerender header persistence / 預渲染標頭保存', () => {
  it('preserves the first render when an auxiliary renderer closes without pages', async () => {
    const values = new Map()
    const storage = { setItem: vi.fn(async (key, value) => { values.set(key, value) }) }
    await savePrerenderedHeaders({ '/': { 'content-security-policy': "default-src 'self'" } }, storage)
    await savePrerenderedHeaders({}, storage)
    expect(values.get('headers.json')).toEqual({ '/': { 'content-security-policy': "default-src 'self'" } })
    expect(storage.setItem).toHaveBeenCalledTimes(1)
  })

  it('normalizes arrays and removes internal headers without losing security headers', async () => {
    const storage = { setItem: vi.fn(async () => {}) }
    await savePrerenderedHeaders({ '/static': { 'X-Nitro-Prerender': '/other', 'permissions-policy': ['camera=()', 'microphone=()'] } }, storage)
    expect(storage.setItem).toHaveBeenCalledWith('headers.json', { '/static': { 'permissions-policy': 'camera=();microphone=()' } })
  })
})
