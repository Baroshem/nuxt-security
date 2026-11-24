import { describe, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({ config: { enabled: false, name: 'test', pass: 'pass', message: 'test', exclude: ['/public'], include: ['/public/private'] } }))
vi.mock('#nuxt-security/server', () => ({
  defineEventHandler: (handler: unknown) => handler,
  useRuntimeConfig: () => ({ private: { basicAuth: state.config } }),
  getRequestHeader: () => undefined,
  setHeader: () => {},
  createError: (value: { statusCode: number }) => Object.assign(new Error('denied'), value)
}))
import handler from '../src/runtime/server/middleware/basicAuth'
const event = (path: string) => ({ path }) as Parameters<typeof handler>[0]
describe('runtime auth and path boundaries / 執行時認證與路徑邊界', () => {
  it('toggles enabled without rebuilding the handler', () => {
    expect(handler(event('/api'))).toBeUndefined()
    state.config.enabled = true
    expect(() => handler(event('/api'))).toThrow(expect.objectContaining({ statusCode: 401 }))
    state.config.enabled = false
    expect(handler(event('/api'))).toBeUndefined()
  })
  it('keeps include priority and does not exclude lookalike prefixes', () => {
    state.config.enabled = true
    expect(handler(event('/public/hello'))).toBeUndefined()
    expect(handler(event('/public/private-looking'))).toBeUndefined()
    expect(() => handler(event('/public/private/data'))).toThrow()
    expect(() => handler(event('/publicity'))).toThrow()
  })
})
