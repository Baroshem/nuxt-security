import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Nuxt 5 runs module server code that imports h3, nitropack or #imports under its Nitro v2 compatibility layer
// (warning NUXT_B9003), unless the file also imports from Nitro v3, which #nuxt-security/server does on Nitro v3
const entryDirs = ['../src/runtime/nitro/plugins/', '../src/runtime/server/middleware/']
const entries = entryDirs.flatMap(dir => readdirSync(new URL(dir, import.meta.url)).map(name => dir.slice('../src/'.length) + name))
const IMPORT_RE = /^import\s+(type\s+)?[^'"]*?\bfrom\s+['"]([^'"]+)['"]/gm

describe('[nuxt-security] Server runtime imports', () => {
  it.each(entries)('%s imports h3 and Nitro from #nuxt-security/server', (entry) => {
    const code = readFileSync(new URL(`../src/${entry}`, import.meta.url), 'utf8')
    const valueImports = [...code.matchAll(IMPORT_RE)].filter(([, type]) => !type).map(([, , from]) => from)

    expect(valueImports).toContain('#nuxt-security/server')
    expect(valueImports.filter(from => /^(?:h3|nitropack|#imports)(?:\/|$)/.test(from))).toEqual([])
    // h3 v2 only has event.node on Node.js
    expect(code).not.toContain('event.node.req')
  })
})
