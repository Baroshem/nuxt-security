import type { FilterXSS } from 'xss'

/** Inspect values rather than JSON-escaped markup. / 檢查原始字串，避免 JSON 跳脫造成誤判。 */
export function hasUnsafeXssPayload(value: unknown, filter: FilterXSS): boolean {
  const pending: unknown[] = [value]
  const visited = new WeakSet<object>()
  while (pending.length) {
    const current = pending.pop()
    if (typeof current === 'string') {
      // Comparisons such as SQL's <> are data, not HTML tags. / SQL 的 <> 等比較運算是資料而非 HTML tag。
      if (/<(?:[a-z][\w:-]*|\/[a-z][\w:-]*|!--|!doctype)(?:[\s/>]|$)/i.test(current) && filter.process(current) !== current) return true
    } else if (current && typeof current === 'object' && !ArrayBuffer.isView(current)) {
      if (visited.has(current)) continue
      visited.add(current)
      for (const [key, item] of Object.entries(current)) pending.push(key, item)
    }
  }
  return false
}
