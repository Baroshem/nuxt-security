import { createClient } from 'redis'
import { redisRateLimitStore } from '../../src/utils/rateLimit.ts'
const client = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:16381' })
client.on('error', () => {})
await client.connect()
try {
  const store = redisRateLimitStore(client, process.argv[2])
  const result = await Promise.all(Array.from({ length: 50 }, () => store.consume('shared', 10, 10000, Date.now())))
  console.log(JSON.stringify({ allowed: result.filter(value => value.allowed).length }))
} finally { await client.quit() }
