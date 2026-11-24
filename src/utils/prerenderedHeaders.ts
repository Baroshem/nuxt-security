import type { OutgoingHttpHeaders } from 'node:http'

/** Keep a second empty renderer from erasing the first one's headers. / 避免空 renderer 清除既有標頭。 */
export async function savePrerenderedHeaders(
  collected: Record<string, OutgoingHttpHeaders>,
  storage: { setItem: (key: string, value: Record<string, Record<string, unknown>>) => Promise<unknown> }
) {
  if (!Object.keys(collected).length) return
  const headers = Object.fromEntries(Object.entries(collected).map(([path, values]) => [
    path,
    Object.fromEntries(Object.entries(values)
      .filter(([header]) => header.toLowerCase() !== 'x-nitro-prerender')
      .map(([header, value]) => [header, Array.isArray(value) ? value.join(';') : value]))
  ]))
  await storage.setItem('headers.json', headers)
}
