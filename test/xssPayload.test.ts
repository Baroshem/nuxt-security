import { describe, expect, it } from 'vitest'
import { FilterXSS } from 'xss'
import { hasUnsafeXssPayload } from '../src/utils/xss'

const filter = new FilterXSS()
describe('XSS payload values / XSS 輸入值', () => {
  it.each([
    { query: "SELECT * WHERE navigation <> 'false'" },
    { content: '1 < 2 and 3 > 1' },
    { content: '<p>Hello <strong>world</strong></p>' },
    { content: '<a href="https://example.com">link</a>' },
    { content: '<a title="hello">text</a>' },
    { nested: ['plain "quotes"', { text: '<br>' }] }
  ])('accepts allowed rich text without JSON escaping artifacts: %j', value => {
    expect(hasUnsafeXssPayload(value, filter)).toBe(false)
  })

  it.each([
    { content: '<script>alert(1)</script>' },
    { nested: [{ text: '<img src="x" onerror="alert(1)">' }] },
    { content: '<a href="javascript:alert(1)">click</a>' },
    { content: '<a href="&#106;avascript:alert(1)">click</a>' },
    { statusMessage: 'Bad Request', content: '<script>alert(1)</script>' },
    { '<script>alert(1)</script>': 'safe value' }
  ])('rejects unsafe values and keys: %j', value => {
    expect(hasUnsafeXssPayload(value, filter)).toBe(true)
  })

  it('leaves the original payload intact for downstream validation', () => {
    const value = { content: '<a href="https://example.com">link</a>' }
    const original = structuredClone(value)
    hasUnsafeXssPayload(value, filter)
    expect(value).toEqual(original)
  })
})
