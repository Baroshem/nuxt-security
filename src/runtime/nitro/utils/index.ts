import { createHash } from 'node:crypto'
import { createDefu } from 'defu'

export const defuReplaceArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

export function generateHash (content: Buffer | string, hashAlgorithm: string) {
  const hash = createHash(hashAlgorithm)
  hash.update(content)
  return `${hashAlgorithm}-${hash.digest('base64')}`
}
