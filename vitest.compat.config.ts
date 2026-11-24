import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { include: ['compat/**/*.test.ts'], testTimeout: 30000, hookTimeout: 30000, maxWorkers: 1 } })
