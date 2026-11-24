import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'

const latePublicAsset = defineNuxtModule({
  setup (_options, nuxt) {
    const dir = join(nuxt.options.buildDir, 'late-public-asset')
    const file = join(dir, 'asset.txt')

    nuxt.hook('nitro:config', async (nitroConfig) => {
      await mkdir(dir, { recursive: true })
      await writeFile(file, '')
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({ dir, baseURL: '/late-assets' })
    })

    nuxt.hook('nitro:init', (nitro) => {
      nitro.hooks.hook('rollup:before', () => writeFile(file, 'final asset contents'))
    })
  },
})

export default defineNuxtConfig({

  modules: [latePublicAsset, '../../../src/module'],
  experimental: {
    inlineSSRStyles: false, // disable inlining css to test asset import
    entryImportMap: true
  },
  vite: {
    build: {
      target: 'esnext' // ensure the entry import map is used by this fixture
    }
  },

  // Per route configuration
  routeRules: {
    '/public': {
      prerender: true,
    }
  },

  // Global configuration
  security: {
    rateLimiter: false,
    sri: true
  },

})
