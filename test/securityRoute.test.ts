import { beforeEach, describe, expect, it } from 'vitest'
import type { H3Event } from 'h3'
import { getAppSecurityOptions, resolveSecurityRoute, resolveSecurityRules } from '../src/runtime/nitro/context'

function event(path: string) { return { path, context: {} } as H3Event }

describe('security route counters / 安全路由計數範圍', () => {
  beforeEach(() => {
    const options = getAppSecurityOptions()
    for (const key of Object.keys(options)) delete options[key]
    Object.assign(options, {
      '/**': { rateLimiter: { tokensPerInterval: 20 } },
      '/api/**': { rateLimiter: { tokensPerInterval: 10 } },
      '/api/search/**': { rateLimiter: { tokensPerInterval: 2 } }
    })
  })

  it.each(['/api/search', '/api/search/', '/api/search?q=x', '/api/search/abc'])(
    'uses the same wildcard counter and limits for %s', path => {
      const request = event(path)
      expect(resolveSecurityRoute(request)).toBe('/api/search/**')
      expect(resolveSecurityRules(request).rateLimiter).toMatchObject({ tokensPerInterval: 2 })
    }
  )

  it('lets an exact rule win over its wildcard', () => {
    getAppSecurityOptions()['/api/search'] = { rateLimiter: { tokensPerInterval: 1 } }
    expect(resolveSecurityRoute(event('/api/search'))).toBe('/api/search')
    expect(resolveSecurityRoute(event('/api/search/abc'))).toBe('/api/search/**')
  })

  it('does not attach unrelated paths to the restricted counter', () => {
    expect(resolveSecurityRoute(event('/api/searching'))).toBe('/api/**')
    expect(resolveSecurityRoute(event('/'))).toBe('/**')
  })
})

it('isolates per-request runtime overrides without mutating shared rules', () => {
  const first = event('/')
  first.context.security = { globalRules: { enabled: true, rateLimiter: { tokensPerInterval: 1 } } }
  const second = event('/')
  second.context.security = { globalRules: { enabled: true, rateLimiter: { tokensPerInterval: 3 } } }
  expect(resolveSecurityRules(first).rateLimiter).toMatchObject({ tokensPerInterval: 1 })
  expect(resolveSecurityRules(second).rateLimiter).toMatchObject({ tokensPerInterval: 3 })
  expect(getAppSecurityOptions()['/**'].rateLimiter).toMatchObject({ tokensPerInterval: 20 })
})
