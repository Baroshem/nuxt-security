import { describe, expect, it } from 'vitest'
import { readLimitedBody } from '../src/utils/limitedBody'

function chunks(...values: string[]) { return (async function* () { for (const value of values) yield new TextEncoder().encode(value) })() }
describe('bounded body bytes / 有界 body bytes', () => {
  it('accepts exactly the maximum and handles multibyte text as bytes', async () => {
    expect(new TextDecoder().decode(await readLimitedBody(chunks('a', '中'), 4))).toBe('a中')
    await expect(readLimitedBody(chunks('a', '中'), 3)).rejects.toMatchObject({ statusCode: 413 })
  })
  it('rejects oversized chunked bodies without Content-Length', async () => {
    await expect(readLimitedBody(chunks('aa', 'bb', 'cc'), 5)).rejects.toMatchObject({ statusCode: 413 })
  })
  it('cancels an oversized Web stream and handles empty input', async () => {
    let cancelled = false
    const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(4)) }, cancel() { cancelled = true } })
    await expect(readLimitedBody(stream, 3)).rejects.toMatchObject({ statusCode: 413 })
    expect(cancelled).toBe(true)
    expect(await readLimitedBody(null, 0)).toHaveLength(0)
  })
})
