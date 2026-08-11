import { FilterXSS, type IFilterXSSOptions } from 'xss'

const DANGEROUS_URL_ATTRS = new Set(['href', 'src', 'background', 'style'])
const DANGEROUS_PROTOCOLS = /^\s*(?:javascript|vbscript|data\s*:\s*(?!image\/(?!svg)))/i
const MAX_DEPTH = 20

function createMaliciousHtmlDetector (baseOptions: IFilterXSSOptions) {
  let isMalicious = false

  const detector = new FilterXSS({
    ...baseOptions,
    onIgnoreTag (tag, html, options) {
      if (!options.isClosing) {
        isMalicious = true
      }
      return baseOptions.onIgnoreTag?.(tag, html, options)
    },
    onIgnoreTagAttr (tag, name, attrValue, isWhiteAttr) {
      if (name.startsWith('on')) {
        isMalicious = true
      }
      return baseOptions.onIgnoreTagAttr?.(tag, name, attrValue, isWhiteAttr)
    },
    safeAttrValue (tag, name, attrValue, cssFilter) {
      if (DANGEROUS_URL_ATTRS.has(name) && DANGEROUS_PROTOCOLS.test(attrValue)) {
        isMalicious = true
      }
      if (baseOptions.safeAttrValue) {
        return baseOptions.safeAttrValue(tag, name, attrValue, cssFilter)
      }
      return attrValue
    }
  })

  return (value: string): boolean => {
    isMalicious = false
    detector.process(value)
    return isMalicious
  }
}

function isRecord (value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function hasMaliciousPayload (value: unknown, options: IFilterXSSOptions): boolean {
  const isMaliciousHtml = createMaliciousHtmlDetector(options)

  const inspect = (current: unknown, depth = 0): boolean => {
    if (depth > MAX_DEPTH) {
      return true
    }

    if (typeof current === 'string') {
      return isMaliciousHtml(current)
    }

    if (Array.isArray(current)) {
      return current.some(item => inspect(item, depth + 1))
    }

    if (isRecord(current)) {
      return Object.values(current)
        .some(item => inspect(item, depth + 1))
    }

    return false
  }

  return inspect(value)
}
