import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import type { Nitro } from 'nitropack'
import { join, resolve } from 'pathe'


export default async function (nitro: Nitro) {
  const hashAlgorithm = 'sha384'
  const builtAssetsHashes: Record<string, string> = {}

  // find the /_nuxt directory with the public assets
  const publicAssets = nitro.options.publicAssets
  const { cdnURL = '', baseURL = '', buildAssetsDir = '' } = nitro.options.runtimeConfig.app
  const buildPublicAssets = publicAssets.find(publicAsset => publicAsset.baseURL === resolve(buildAssetsDir))
  if (!buildPublicAssets) {
    return
  }
  const buildAssetsPath = buildPublicAssets.dir

  // scan the files in the /_nuxt directory and computes hashes
  const entries = await readdir(buildAssetsPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(entry.path, entry.name)
    const fileContent = await readFile(fullPath)
    const hash = generateHash(fileContent, hashAlgorithm)
    const relativeUrl = join(buildAssetsDir, entry.name)
    // construct the url that will appear in the head template
    let key:string
    if (cdnURL) {
      key = new URL(relativeUrl, cdnURL).href
    } else {
      key = join(baseURL, relativeUrl)
    }
    builtAssetsHashes[key] = hash
  }

  // Save hashes in a /integrity directory within the .nuxt build
  const buildDir = nitro.options.buildDir
  const integrityDir = join(buildDir, 'integrity')
  await mkdir(integrityDir)
  const hashFilePath = join(integrityDir, 'sriHashes.json')
  await writeFile(hashFilePath, JSON.stringify(builtAssetsHashes))

  // Mount the /integrity directory into server assets for later use with SSR
  nitro.options.serverAssets.push({ dir: integrityDir, baseName: 'integrity' })

}

function generateHash (content: any, hashAlgorithm: string) {
  const hash = createHash(hashAlgorithm)
  hash.update(content)
  return `${hashAlgorithm}-${hash.digest('base64')}`
}
