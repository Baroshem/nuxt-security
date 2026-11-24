import { describe, it, expect, vi } from 'vitest'

// Mock @nuxt/kit to simulate @nuxt/hints presence and avoid Nuxt context errors
vi.mock('@nuxt/kit', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    resolveServerVariant: vi.fn(() => "nitro2"),
    importModule: vi.fn(actual.importModule),
    hasNuxtModule: vi.fn((name) => name === '@nuxt/hints'),
    addServerHandler: vi.fn(),
    addPlugin: vi.fn(),
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
        routeRules: { '/__nuxt_hints/**': { csurf: false, robots: false, security: { nonce: false } } },
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
    expect(nuxt.options.routeRules['/__nuxt_hints/**']).toMatchObject({ csurf: false, robots: false, security: { nonce: false } })
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

describe('latest Nuxt build configuration / 最新 Nuxt 建置設定', () => {
  function createNuxt() {
    return {
      options: {
        routeRules: {}, security: {}, runtimeConfig: { security: {}, private: {} },
        build: { transpile: [] }, devServer: { url: 'http://localhost' },
        nitro: { routeRules: {}, virtual: {}, publicAssets: [] }, vite: {}, dev: false,
      },
      hooks: { callHook: vi.fn(), hook: vi.fn() }, hook: vi.fn()
    }
  }

  it('uses Vite 8 Oxc compression without injecting esbuild options', async () => {
    const nuxt = createNuxt()
    await securityModule({}, nuxt)
    expect(nuxt.options.vite.esbuild).toBeUndefined()
    expect(nuxt.options.vite.build.rolldownOptions.output.minify.compress).toMatchObject({ dropConsole: true, dropDebugger: true })
  })

  it('retains the esbuild path on Vite 7', async () => {
    const { importModule } = await import('@nuxt/kit')
    vi.mocked(importModule).mockResolvedValueOnce({ version: '7.3.5' })
    const nuxt = createNuxt()
    await securityModule({}, nuxt)
    expect(nuxt.options.vite.esbuild.drop).toEqual(['console', 'debugger'])
    expect(nuxt.options.vite.build).toBeUndefined()
  })

  it('preserves the explicit terser path', async () => {
    const nuxt = createNuxt()
    nuxt.options.vite.build = { minify: 'terser' }
    await securityModule({}, nuxt)
    expect(nuxt.options.vite.build.terserOptions.compress).toMatchObject({ drop_console: true, drop_debugger: true })
    expect(nuxt.options.vite.esbuild).toBeUndefined()
  })

  it.each(['./', '/cdn/', 'https://cdn.example.com/assets/'])(
    'lazily hashes final bytes with cdnURL %s', async cdnURL => {
      const { mkdtemp, writeFile, unlink, rmdir } = await import('node:fs/promises')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const { createHash } = await import('node:crypto')
      const { useNitro } = await import('@nuxt/kit')
      const dir = await mkdtemp(join(tmpdir(), 'nuxt-security-sri-'))
      const file = join(dir, 'asset.js')
      try {
        await writeFile(file, 'old')
        const nuxt = createNuxt()
        await securityModule({}, nuxt)
        await writeFile(file, 'final')
        vi.mocked(useNitro).mockReturnValueOnce({ options: {
          runtimeConfig: { app: { cdnURL, baseURL: '/' } },
          publicAssets: [{ dir, baseURL: '/_nuxt/' }]
        } })
        const result = await nuxt.options.nitro.virtual['#sri-hashes']()
        const hash = createHash('sha384').update('final').digest('base64')
        const expectedURL = cdnURL === './' ? '_nuxt/asset.js' : `${cdnURL}_nuxt/asset.js`
        expect(JSON.parse(result.replace('export default ', ''))).toEqual({ [expectedURL]: `sha384-${hash}` })
      } finally {
        await unlink(file)
        await rmdir(dir)
      }
    }
  )
})
