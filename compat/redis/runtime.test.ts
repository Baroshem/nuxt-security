import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createClient } from 'redis'
import { redisRateLimitStore } from '../../src/utils/rateLimit'

const url = process.env.REDIS_URL || 'redis://127.0.0.1:16381'
function worker(prefix: string) {
  return new Promise<number>((done, reject) => {
    const child = spawn(process.execPath, [resolve('compat/redis/worker.mjs'), prefix], { env: { ...process.env, REDIS_URL: url }, windowsHide: true })
    let output = ''
    child.stdout.on('data', data => { output += data })
    child.on('error', reject)
    child.on('exit', code => code === 0 ? done(JSON.parse(output).allowed) : reject(new Error(`Redis worker exited ${code}`)))
  })
}
describe('real Redis atomicity / 真實 Redis 原子性', () => {
  it('admits exactly ten requests from two concurrent OS processes', async () => {
    const prefix = `nuxt-security-test:${process.pid}:${Date.now()}:`
    const results = await Promise.all([worker(prefix), worker(prefix)])
    expect(results.reduce((sum, value) => sum + value, 0)).toBe(10)
  })
  it('uses server time, expires counters and rejects zero tokens', async () => {
    const client = createClient({ url })
    client.on('error', () => {})
    await client.connect()
    const prefix = `nuxt-security-test:${process.pid}:${Date.now()}:`
    try {
      const store = redisRateLimitStore(client, prefix)
      const first = await store.consume('expiry', 1, 100, -1000000)
      expect(first.allowed).toBe(true)
      expect(first.reset).toBeGreaterThan(Date.now() - 1000)
      expect((await store.consume('expiry', 1, 100, 0)).allowed).toBe(false)
      await new Promise(resolve => setTimeout(resolve, 150))
      expect((await store.consume('expiry', 1, 100, 0)).allowed).toBe(true)
      expect((await store.consume('zero', 0, 100, 0)).allowed).toBe(false)
    } finally { await client.quit() }
  })
})
