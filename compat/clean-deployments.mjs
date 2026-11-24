import { rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Restrict recursive removal to generated children of this fixture. / 僅清除 fixture 內的生成目錄。
const root = fileURLToPath(new URL('./deployments/', import.meta.url))
for (const directory of ['.output', '.output-bun', '.vercel']) {
  const target = resolve(root, directory)
  if (dirname(target) !== resolve(root)) throw new Error(`Unexpected generated directory: ${target}`)
  rmSync(target, { recursive: true, force: true })
}
