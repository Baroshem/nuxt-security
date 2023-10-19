import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import type { Nitro } from 'nitropack'
import { join } from 'pathe'


export default async function (nitro: Nitro) {
  const hashAlgorithm = 'sha384'
  const sriHashes: Record<string, string> = {}

  // Will be later necessary to construct url
  const { cdnURL: appCdnUrl = '', baseURL: appBaseUrl } = nitro.options.runtimeConfig.app

  // Go through all public assets folder by folder
  const publicAssets = nitro.options.publicAssets
  for (const publicAsset of publicAssets) {
    const { dir, baseURL = '' } = publicAsset
    // TBD
    // recursive option on readdir is supported since NodeJS 18
    // do we have a minimum build engine requirement ?
    const entries = await readdir(dir, { withFileTypes: true, recursive: true })
    console.log(`in ${dir}`, publicAsset, entries)
    for (const entry of entries) {
      if (entry.isFile()) {
        const fullPath = join(entry.path, entry.name)
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

  // Save hashes in a /integrity directory within the .nuxt build for later use with SSG
  const buildDir = nitro.options.buildDir
  const integrityDir = join(buildDir, 'integrity')
  await mkdir(integrityDir)
  const hashFilePath = join(integrityDir, 'sriHashes.json')
  await writeFile(hashFilePath, JSON.stringify(sriHashes))

  // Mount the /integrity directory into server assets for later use with SSR
  nitro.options.serverAssets.push({ dir: integrityDir, baseName: 'integrity' })

}

function generateHash (content: Buffer, hashAlgorithm: string) {
  const hash = createHash(hashAlgorithm)
  hash.update(content)
  return `${hashAlgorithm}-${hash.digest('base64')}`
}
