import { redisRateLimitStore } from '../../../utils/rateLimit'

const clients = new Map<string, Promise<ReturnType<typeof redisRateLimitStore>>>()
export function useRedisRateLimiter(url: string, prefix?: string) {
  const key = JSON.stringify([url, prefix])
  let pending = clients.get(key)
  if (!pending) {
    pending = import('redis').then(async ({ createClient }) => {
      const client = createClient({ url, socket: { reconnectStrategy: false, connectTimeout: 5000 } })
      client.on('error', () => {})
      await client.connect()
      return redisRateLimitStore(client, prefix)
    })
    clients.set(key, pending)
    pending.catch(() => { if (clients.get(key) === pending) clients.delete(key) })
  }
  return pending
}
