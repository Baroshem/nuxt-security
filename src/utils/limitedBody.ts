/** Read at most limit bytes; release buffered chunks on failure. / 最多讀取上限 bytes，失敗即釋放暫存。 */
export async function readLimitedBody(stream: AsyncIterable<Uint8Array> | ReadableStream<Uint8Array> | null, limit: number): Promise<Uint8Array> {
  if (!Number.isSafeInteger(limit) || limit < 0) throw new Error('Invalid body limit / Body 上限無效')
  if (!stream) return new Uint8Array()
  let size = 0
  const chunks: Uint8Array[] = []
  // The Web stream reader cancels the stream on failure. / Web reader 失敗時取消串流。
  const web = 'getReader' in stream ? stream.getReader() : undefined
  try {
    if (web) {
      let reading = true
      while (reading) {
        const { value, done } = await web.read()
        if (done) { reading = false; break }
        size += value.byteLength
        if (size > limit) throw Object.assign(new Error('Payload Too Large'), { statusCode: 413 })
        chunks.push(value)
      }
    } else {
      for await (const value of stream as AsyncIterable<Uint8Array>) {
        size += value.byteLength
        if (size > limit) throw Object.assign(new Error('Payload Too Large'), { statusCode: 413 })
        chunks.push(value)
      }
    }
  } catch (error) {
    if (web) void web.cancel().catch(() => {})
    throw error
  } finally { web?.releaseLock() }
  const result = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength }
  return result
}
