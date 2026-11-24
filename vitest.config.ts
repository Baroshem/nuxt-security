import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: { include: ["test/**/*.test.ts"] },
  resolve: { alias: { '#nuxt-security/redis': fileURLToPath(new URL('./src/runtime/nitro/context/rateLimit.ts', import.meta.url)), '#nuxt-security/server': fileURLToPath(new URL('./src/runtime/nitro/adapters/nitro2.ts', import.meta.url)) } }
})
