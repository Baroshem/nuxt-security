import type { ModuleOptions } from '../types/module'

/** Publish only capability names/booleans, never configuration values. / 僅輸出功能名稱與布林值，不輸出設定內容。 */
export function securitySummary(options: Partial<ModuleOptions>, routes: Record<string, unknown>) {
  const capabilities = ['requestSizeLimiter', 'rateLimiter', 'xssValidator', 'corsHandler', 'allowedMethodsRestricter', 'csrf', 'nonce', 'sri'] as const
  return {
    enabled: options.enabled !== false,
    middleware: Object.fromEntries(capabilities.map(name => [name, Boolean(options[name])])),
    headers: options.headers ? Object.entries(options.headers).filter(([, value]) => value !== false).map(([name]) => name) : [],
    routes: Object.keys(routes)
  }
}
