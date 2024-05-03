import { createHash } from 'node:crypto';

export function generateHash(content: Buffer | string, hashAlgorithm: string) {
  const hash = createHash(hashAlgorithm);
  hash.update(content);
  return `${hashAlgorithm}-${hash.digest('base64')}`;
}
