import { describe, expect, it } from 'vitest'
import { hasMaliciousPayload } from '../src/runtime/server/utils/xssPayload'
import type { IFilterXSSOptions } from 'xss'

const defaultOptions: IFilterXSSOptions = {}

describe('hasMaliciousPayload', () => {
  describe('safe inputs', () => {
    it('returns false for plain text', () => {
      expect(hasMaliciousPayload('hello world', defaultOptions)).toBe(false)
    })

    it('returns false for allowed HTML tags', () => {
      expect(hasMaliciousPayload('<p>paragraph</p>', defaultOptions)).toBe(false)
    })

    it('returns false for allowed attributes', () => {
      expect(hasMaliciousPayload('<a href="https://example.com">link</a>', defaultOptions)).toBe(false)
    })

    it('returns false for rich text with inline styles', () => {
      expect(hasMaliciousPayload('<p style="text-align:center">hello</p>', defaultOptions)).toBe(false)
    })

    it('returns false for numbers and booleans', () => {
      expect(hasMaliciousPayload(42, defaultOptions)).toBe(false)
      expect(hasMaliciousPayload(true, defaultOptions)).toBe(false)
      expect(hasMaliciousPayload(null, defaultOptions)).toBe(false)
    })

    it('returns false for objects with safe string values', () => {
      expect(hasMaliciousPayload({ name: 'John', bio: '<p>Hello</p>' }, defaultOptions)).toBe(false)
    })

    it('returns false for arrays with safe values', () => {
      expect(hasMaliciousPayload(['hello', '<b>bold</b>'], defaultOptions)).toBe(false)
    })
  })

  describe('malicious tags', () => {
    it('detects <script> tags', () => {
      expect(hasMaliciousPayload('<script>alert(1)</script>', defaultOptions)).toBe(true)
    })

    it('detects <iframe> tags', () => {
      expect(hasMaliciousPayload('<iframe src="http://evil.com"></iframe>', defaultOptions)).toBe(true)
    })

    it('detects <object> tags', () => {
      expect(hasMaliciousPayload('<object data="evil.swf"></object>', defaultOptions)).toBe(true)
    })

    it('detects <embed> tags', () => {
      expect(hasMaliciousPayload('<embed src="evil.swf">', defaultOptions)).toBe(true)
    })

    it('detects <svg> with nested payload', () => {
      expect(hasMaliciousPayload('<svg onload="alert(1)">', defaultOptions)).toBe(true)
    })
  })

  describe('malicious attributes', () => {
    it('detects onclick handlers', () => {
      expect(hasMaliciousPayload('<div onclick="alert(1)">click</div>', defaultOptions)).toBe(true)
    })

    it('detects onerror handlers', () => {
      expect(hasMaliciousPayload('<img onerror="alert(1)" src="x">', defaultOptions)).toBe(true)
    })

    it('detects onload handlers', () => {
      expect(hasMaliciousPayload('<body onload="alert(1)">', defaultOptions)).toBe(true)
    })

    it('detects onmouseover handlers', () => {
      expect(hasMaliciousPayload('<a onmouseover="alert(1)">hover</a>', defaultOptions)).toBe(true)
    })
  })

  describe('dangerous URL attributes', () => {
    it('detects javascript: in href', () => {
      expect(hasMaliciousPayload('<a href="javascript:alert(1)">click</a>', defaultOptions)).toBe(true)
    })

    it('detects javascript: in src', () => {
      expect(hasMaliciousPayload('<img src="javascript:alert(1)">', defaultOptions)).toBe(true)
    })

    it('detects data: URI in src', () => {
      expect(hasMaliciousPayload('<img src="data:text/html,<script>alert(1)</script>">', defaultOptions)).toBe(true)
    })
  })

  describe('nested payloads', () => {
    it('detects malicious value in nested object', () => {
      const payload = {
        user: {
          profile: {
            bio: '<script>alert(1)</script>'
          }
        }
      }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('detects malicious value in array', () => {
      const payload = ['safe text', '<img onerror="alert(1)" src="x">']
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('detects malicious value in array within object', () => {
      const payload = {
        tags: ['<b>bold</b>', '<script>alert(1)</script>']
      }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('returns false when all nested values are safe', () => {
      const payload = {
        items: [
          { title: 'Hello', content: '<p>World</p>' },
          { title: 'Foo', content: '<strong>Bar</strong>' }
        ]
      }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('returns false for empty string', () => {
      expect(hasMaliciousPayload('', defaultOptions)).toBe(false)
    })

    it('returns false for empty object', () => {
      expect(hasMaliciousPayload({}, defaultOptions)).toBe(false)
    })

    it('returns false for empty array', () => {
      expect(hasMaliciousPayload([], defaultOptions)).toBe(false)
    })

    it('handles closing tag without opening (not malicious)', () => {
      expect(hasMaliciousPayload('</script>', defaultOptions)).toBe(false)
    })

    it('detects uppercase event handlers', () => {
      expect(hasMaliciousPayload('<div ONCLICK="alert(1)">x</div>', defaultOptions)).toBe(true)
    })

    it('detects mixed-case event handlers', () => {
      expect(hasMaliciousPayload('<div OnError="alert(1)">x</div>', defaultOptions)).toBe(true)
    })

    it('handles strings that look like HTML but use unknown tags', () => {
      // Non-whitelisted tags trigger detection even if harmless-looking
      expect(hasMaliciousPayload('<custom-element>hello</custom-element>', defaultOptions)).toBe(true)
    })

    it('flags angle brackets that parse as tags (expected false positive)', () => {
      // The xss parser sees `< 2 and 3 >` as a non-whitelisted tag — this is an acceptable
      // trade-off for a security validator (overly cautious with angle brackets)
      expect(hasMaliciousPayload('1 < 2 and 3 > 1', defaultOptions)).toBe(true)
    })

    it('flags any less-than that the parser sees as a tag opener (expected false positive)', () => {
      // Even `a < b` is parsed as containing a tag — this is inherent to the xss library's parser
      expect(hasMaliciousPayload('a < b', defaultOptions)).toBe(true)
    })

    it('allows greater-than signs (not tag openers)', () => {
      expect(hasMaliciousPayload('a > b', defaultOptions)).toBe(false)
    })

    it('detects javascript: with leading whitespace in href', () => {
      expect(hasMaliciousPayload('<a href="  javascript:alert(1)">x</a>', defaultOptions)).toBe(true)
    })

    it('detects vbscript: protocol in href', () => {
      expect(hasMaliciousPayload('<a href="vbscript:alert(1)">x</a>', defaultOptions)).toBe(true)
    })

    it('allows legitimate data: image URIs in src', () => {
      // data:image/png is considered safe by the xss library's default safeAttrValue
      expect(hasMaliciousPayload('<img src="data:image/png;base64,iVBOR">', defaultOptions)).toBe(false)
    })

    it('detects data:image/svg+xml with embedded payload', () => {
      // SVG can contain scripts and event handlers
      expect(hasMaliciousPayload('<img src="data:image/svg+xml,<svg onload=alert(1)>">', defaultOptions)).toBe(true)
    })

    it('allows legitimate raster data URIs (png, jpg, etc.)', () => {
      expect(hasMaliciousPayload('<img src="data:image/png;base64,iVBOR">', defaultOptions)).toBe(false)
      expect(hasMaliciousPayload('<img src="data:image/jpeg;base64,/9j/4AAQ">', defaultOptions)).toBe(false)
      expect(hasMaliciousPayload('<img src="data:image/gif;base64,R0lGODlh">', defaultOptions)).toBe(false)
      expect(hasMaliciousPayload('<img src="data:image/webp;base64,UklGRiIAAABX">', defaultOptions)).toBe(false)
    })

    it('detects data: image/ protocol with leading whitespace', () => {
      expect(hasMaliciousPayload('<img src="  data:image/svg+xml,<svg>">', defaultOptions)).toBe(true)
      expect(hasMaliciousPayload('<a href=" data: text/html , <script>">x</a>', defaultOptions)).toBe(true)
    })

    it('detects SVG with event handler', () => {
      expect(hasMaliciousPayload('<svg><animate onbegin="alert(1)"></animate></svg>', defaultOptions)).toBe(true)
    })

    it('detects payload hidden in deeply nested structure', () => {
      const payload = { a: { b: { c: { d: { e: '<script>x</script>' } } } } }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('handles object with prototype pollution keys safely', () => {
      const payload = { __proto__: '<script>x</script>', constructor: '<img onerror="x" src="y">' }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('handles multipart-like array of objects (as returned by readMultipartFormData)', () => {
      const payload = [
        { name: 'file', filename: 'safe.txt', data: Buffer.from('hello') },
        { name: 'field', data: '<script>alert(1)</script>' }
      ]
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('returns false for multipart-like array with safe values', () => {
      const payload = [
        { name: 'title', data: 'My Document' },
        { name: 'body', data: '<p>Safe content</p>' }
      ]
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(false)
    })

    it('returns true when nesting exceeds depth limit (safety cutoff)', () => {
      // Build a payload nested beyond MAX_DEPTH (20)
      let payload: any = { value: '<script>x</script>' }
      for (let i = 0; i < 25; i++) {
        payload = { safe: payload }
      }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('still detects malicious content at edge of depth limit', () => {
      // Exactly at MAX_DEPTH, detection should still work
      let payload: any = { value: '<script>x</script>' }
      for (let i = 0; i < 19; i++) {
        payload = { safe: payload }
      }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })

    it('returns false for safe content deep but within depth limit', () => {
      let payload: any = { value: '<p>safe</p>' }
      for (let i = 0; i < 15; i++) {
        payload = { safe: payload }
      }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(false)
    })

    it('does not skip detection when payload contains statusMessage', () => {
      // statusMessage is user-controlled request data — must not affect detection
      const payload = { statusMessage: 'Bad Request', description: '<script>alert(1)</script>' }
      expect(hasMaliciousPayload(payload, defaultOptions)).toBe(true)
    })
  })

  describe('custom options', () => {
    it('respects custom whiteList allowing script tags', () => {
      const options: IFilterXSSOptions = {
        whiteList: { script: [], p: [], a: ['href'] }
      }
      expect(hasMaliciousPayload('<script>alert(1)</script>', options)).toBe(false)
    })

    it('detects non-whitelisted tags with custom whiteList', () => {
      const options: IFilterXSSOptions = {
        whiteList: { p: [], a: ['href'] }
      }
      expect(hasMaliciousPayload('<div>hello</div>', options)).toBe(true)
    })
  })
})
