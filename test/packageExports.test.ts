import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'

it('resolves the package entry from CommonJS while preserving import and types conditions', () => {
  const consumer = mkdtempSync(join(tmpdir(), 'nuxt-security-exports-'))
  try {
    const packageDir = join(consumer, 'node_modules', 'nuxt-security')
    mkdirSync(join(packageDir, 'dist'), { recursive: true })
    writeFileSync(join(packageDir, 'package.json'), readFileSync(new URL('../package.json', import.meta.url)))
    writeFileSync(join(packageDir, 'dist', 'module.mjs'), 'export default "module-entry"')
    writeFileSync(join(packageDir, 'dist', 'types.d.mts'), 'export default "types-entry"')

    const require = createRequire(join(consumer, 'consumer.cjs'))
    const modulePath = realpathSync(join(packageDir, 'dist', 'module.mjs'))
    expect(require.resolve('nuxt-security')).toBe(modulePath)

    const imported = execFileSync(process.execPath, [
      '--input-type=module',
      '-e',
      'import entry from "nuxt-security"; console.log(JSON.stringify({ entry, url: import.meta.resolve("nuxt-security") }))'
    ], { cwd: realpathSync(consumer), encoding: 'utf8' })
    expect(JSON.parse(imported)).toEqual({ entry: 'module-entry', url: pathToFileURL(modulePath).href })

    const typesPath = realpathSync(join(packageDir, 'dist', 'types.d.mts'))
    const typesResolution = execFileSync(process.execPath, [
      '--conditions=types',
      '--input-type=module',
      '-e',
      'console.log(import.meta.resolve("nuxt-security"))'
    ], { cwd: realpathSync(consumer), encoding: 'utf8' })
    expect(typesResolution.trim()).toBe(pathToFileURL(typesPath).href)
  } finally {
    rmSync(consumer, { recursive: true, force: true })
  }
})
