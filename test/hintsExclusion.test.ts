import { describe, it, expect, vi } from 'vitest'

// Mock @nuxt/kit to simulate @nuxt/hints presence and avoid Nuxt context errors
vi.mock('@nuxt/kit', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    hasNuxtModule: vi.fn((name) => name === '@nuxt/hints'),
    addServerHandler: vi.fn(),
    addVitePlugin: vi.fn(),
    addServerPlugin: vi.fn(),
    createResolver: () => ({ resolve: (p) => p }),
    addImportsDir: vi.fn(),
    addServerImports: vi.fn(),
    addTypeTemplate: vi.fn(),
    useNitro: vi.fn(() => ({ options: { routeRules: {}, virtual: {}, publicAssets: [] }, hooks: { hook: vi.fn() } })),
    installModule: vi.fn(),
  }
})

// Import the module after mocking
import securityModule from '../src/module'

describe('nuxt-security module', () => {
  it('should add routeRules exclusion for /__nuxt_hints/** if @nuxt/hints is present', async () => {
    const nuxt = {
      options: {
        routeRules: undefined,
        security: {},
        runtimeConfig: { security: {}, private: {} },
        build: { transpile: [] },
        devServer: { url: 'http://localhost' },
        nitro: { routeRules: {}, virtual: {}, publicAssets: [] },
        vite: {},
        dev: false,
      },
      hooks: { callHook: vi.fn(), hook: vi.fn() },
      hook: vi.fn(),
    }
    await securityModule({}, nuxt)
    expect(nuxt.options.routeRules).toBeDefined()
    expect(nuxt.options.routeRules['/__nuxt_hints/**']).toBeDefined()
    expect(nuxt.options.routeRules['/__nuxt_hints/**'].security).toMatchObject({
      rateLimiter: false,
      requestSizeLimiter: false,
      xssValidator: false,
      corsHandler: false,
    })
  })

  it('should NOT add routeRules exclusion if @nuxt/hints is not present', async () => {
    // Patch the mock to return false
    const { hasNuxtModule } = await import('@nuxt/kit')
    hasNuxtModule.mockImplementation(() => false)
    const nuxt = {
      options: {
        routeRules: undefined,
        security: {},
        runtimeConfig: { security: {}, private: {} },
        build: { transpile: [] },
        devServer: { url: 'http://localhost' },
        nitro: { routeRules: {}, virtual: {}, publicAssets: [] },
        vite: {},
        dev: false,
      },
      hooks: { callHook: vi.fn(), hook: vi.fn() },
      hook: vi.fn(),
    }
    await securityModule({}, nuxt)
    expect(nuxt.options.routeRules?.['/__nuxt_hints/**']).toBeUndefined()
  })
})
