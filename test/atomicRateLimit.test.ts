import { describe, expect, it } from 'vitest'
import { redisRateLimitStore, REDIS_CONSUME_SCRIPT, withRateLimitLock } from '../src/utils/rateLimit'

// Shared backend with asynchronous transport; all clients share one atomic consume. / 多 client 共用原子 backend。
function backend() {
  let count = 0
  return { async eval(script: string, options: { keys: string[]; arguments: string[] }) {
    expect(script).toBe(REDIS_CONSUME_SCRIPT)
    expect(options.keys).toEqual(['test:client'])
    await new Promise(resolve => setTimeout(resolve, 1))
    const current = ++count
    const limit = Number(options.arguments[0])
    return [current <= limit ? 1 : 0, Math.max(0, limit - current), 10000]
  } }
}

describe('atomic consumption / 原子扣額度', () => {
  it('shares one counter across independent clients under concurrent traffic', async () => {
    const server = backend()
    const clients = [redisRateLimitStore(server, 'test:'), redisRateLimitStore(server, 'test:')]
    const responses = await Promise.all(Array.from({ length: 100 }, (_, i) => clients[i % 2].consume('client', 5, 1000, 0)))
    expect(responses.filter(result => result.allowed)).toHaveLength(5)
    expect(responses.every(result => result.remaining >= 0)).toBe(true)
  })
  it('fails closed on backend failure or malformed data', async () => {
    await expect(redisRateLimitStore({ eval: async () => { throw new Error('offline') } }).consume('client', 1, 1000, 0)).rejects.toThrow('offline')
    await expect(redisRateLimitStore({ eval: async () => [1, 'NaN', 0] }).consume('client', 1, 1000, 0)).rejects.toThrow('Invalid')
  })
  it('serializes local read/modify/write and releases the key after failure', async () => {
    let value = 0
    await Promise.all(Array.from({ length: 100 }, () => withRateLimitLock('local', async () => {
      const current = value
      await Promise.resolve()
      value = current + 1
    })))
    expect(value).toBe(100)
    await expect(withRateLimitLock('local', async () => { throw new Error('failed') })).rejects.toThrow('failed')
    await expect(withRateLimitLock('local', async () => 1)).resolves.toBe(1)
  })
})
