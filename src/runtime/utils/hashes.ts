import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import type { Nitro } from 'nitropack'
import { join } from 'pathe'


export async function hashBundledAssets(nitro: Nitro) {
  const hashAlgorithm = 'sha384'
  const sriHashes: Record<string, string> = {}

  // Will be later necessary to construct url
  const { cdnURL: appCdnUrl = '', baseURL: appBaseUrl } = nitro.options.runtimeConfig.app


  // Go through all public assets folder by folder
  const publicAssets = nitro.options.publicAssets
  for (const publicAsset of publicAssets) {
    const { dir, baseURL = '' } = publicAsset

    if (existsSync(dir)) {
      // Node 16 compatibility maintained
      // Node 18.17+ supports recursive option on readdir
      // const entries = await readdir(dir, { withFileTypes: true, recursive: true })
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile()) {

          // Node 16 compatibility maintained
          // Node 18.17+ supports entry.path on DirEnt
          // const fullPath = join(entry.path, entry.name)
          const fullPath = join(dir, entry.name)
          const fileContent = await readFile(fullPath)
          const hash = generateHash(fileContent, hashAlgorithm)
          // construct the url as it will appear in the head template
          const relativeUrl = join(baseURL, entry.name)
          let url: string
          if (appCdnUrl) {
            // If the cdnURL option was set, the url will be in the form https://...
            url = new URL(relativeUrl, appCdnUrl).href
          } else {
            // If not, the url will be in a relative form: /_nuxt/...
            url = join('/', appBaseUrl, relativeUrl)
          }
          sriHashes[url] = hash
        }
      }
    }
  }
  return sriHashes
}

export function generateHash (content: Buffer | string, hashAlgorithm: string) {
  const hash = createHash(hashAlgorithm)
  hash.update(content)
  return `${hashAlgorithm}-${hash.digest('base64')}`
}
