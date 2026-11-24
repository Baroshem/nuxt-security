import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  values: new Map<string, { value: number, date: number }>(),
  rules: { enabled: true, rateLimiter: { tokensPerInterval: 2, interval: 1000, headers: true } },
  headers: {} as Record<string, unknown>,
  storage: vi.fn(),
  config: vi.fn()
}))
vi.mock('nitropack/runtime', () => ({
  useStorage: state.storage.mockImplementation(() => ({
    getItem: async (key: string) => state.values.get(key),
    setItem: async (key: string, value: { value: number, date: number }) => { state.values.set(key, value) }
  })),
  useRuntimeConfig: state.config.mockImplementation(() => ({ security: {} }))
}))
vi.mock('../src/runtime/nitro/context', () => ({
  resolveSecurityRules: () => state.rules,
  resolveSecurityRoute: () => '/api/**'
}))
vi.mock('h3', () => ({
  defineEventHandler: (handler: unknown) => handler,
  getRequestIP: () => '127.0.0.1',
  getRequestHeader: () => undefined,
  createError: (error: { statusCode: number }) => Object.assign(new Error('limited'), error),
  setResponseHeader: (_event: unknown, key: string, value: unknown) => { state.headers[key] = value }
}))
import handler from '../src/runtime/server/middleware/rateLimiter'

const event = { context: {} } as Parameters<typeof handler>[0]

describe('rate limiter lifecycle / 限流生命週期', () => {
  it('does not access Nitro storage or runtime config during module import', () => {
    expect(state.storage).not.toHaveBeenCalled()
    expect(state.config).not.toHaveBeenCalled()
  })

  beforeEach(() => {
    state.values.clear()
    state.rules.rateLimiter.tokensPerInterval = 2
    vi.spyOn(Date, 'now').mockReturnValue(1000)
  })
  it('fails closed when persisted counters are corrupted', async () => {
    await handler(event)
    const key = [...state.values.keys()][0]
    state.values.set(key, { value: Number.NaN, date: 1000 })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 503 })
  })

  it('counts exactly two requests in both the first and renewed interval', async () => {
    for (const now of [1000, 2000]) {
      vi.mocked(Date.now).mockReturnValue(now)
      await handler(event)
      expect(state.headers['x-ratelimit-remaining']).toBe(1)
      expect(state.headers['x-ratelimit-reset']).toBe(now + 1000)
      await handler(event)
      expect(state.headers['x-ratelimit-remaining']).toBe(0)
      await expect(handler(event)).rejects.toMatchObject({ statusCode: 429 })
    }
    expect(state.config).toHaveBeenCalledWith(event)
  })

  it('rejects the very first request for a zero-token rule', async () => {
    state.rules.rateLimiter.tokensPerInterval = 0
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 429 })
  })
})
