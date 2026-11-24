/** Cloudflare joins overlapping headers; detach before replacing. / Cloudflare 重疊規則需先移除再覆寫。 */
export function normalizeCloudflareHeaders(input: string): string {
  const blocks: { path: string, lines: string[] }[] = []
  for (const line of input.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    if (/^\S/.test(line)) blocks.push({ path: line.trim(), lines: [] })
    else blocks.at(-1)?.lines.push(line.trim())
  }
  if (blocks.length > 100) throw new Error('[nuxt-security] Cloudflare _headers exceeds 100 rules; use server-rendered dynamicNonce or reduce prerendered routes.')
  blocks.sort((a, b) => a.path.replace(/\*.*$/, '').length - b.path.replace(/\*.*$/, '').length || Number(b.path.includes('*')) - Number(a.path.includes('*')))
  const output = blocks.flatMap(({ path, lines }) => [path, ...lines.flatMap(line => {
    if (line.startsWith('! ')) return [`  ${line}`]
    const name = line.slice(0, line.indexOf(':')).trim()
    return [`  ! ${name}`, `  ${line}`]
  })])
  if (output.some(line => line.length > 2000)) throw new Error('[nuxt-security] Cloudflare _headers line exceeds 2000 characters; use server-rendered dynamicNonce or reduce CSP sources.')
  return output.join('\n') + '\n'
}
