// These two lines are required only to maintain compatibility with Node 18
//  - In Node 19 and above, crypto is available in the global scope
//  - In Workers environments, crypto is available in the global scope
import { webcrypto } from 'node:crypto'
globalThis.crypto ??= webcrypto as Crypto

export async function generateHash(content: Buffer | string, hashAlgorithm: 'SHA-256' | 'SHA-384' | 'SHA-512') {
  let buffer: Uint8Array
  if (typeof content === 'string') {
    buffer = new TextEncoder().encode(content);
  } else {
    buffer = new Uint8Array(content);
  }
  const hashBuffer = await crypto.subtle.digest(hashAlgorithm, buffer);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  const prefix = hashAlgorithm.replace('-', '').toLowerCase()
  return `${prefix}-${base64}`;
}

export function generateRandomNonce() {
  const array = new Uint8Array(18);
  crypto.getRandomValues(array)
  const nonce = btoa(String.fromCharCode(...array))
  return nonce
}
