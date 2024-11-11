
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
