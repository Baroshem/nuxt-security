import type { SecurityHeaders } from '../types/headers'

export function extensionHeaders(path: string, rules?: Record<string, { headers: SecurityHeaders }>) {
  if (!rules) return
  let decoded: string
  try { decoded = decodeURIComponent(path.split('?')[0]) } catch { return }
  if (decoded.includes('\0') || decoded.endsWith('/')) return
  const file = decoded.slice(decoded.lastIndexOf('/') + 1).toLowerCase()
  return Object.entries(rules).find(([extension]) => extension.startsWith('.') && file.endsWith(extension.toLowerCase()))?.[1].headers
}
