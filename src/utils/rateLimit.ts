export interface AtomicRateLimitResult { allowed: boolean; remaining: number; reset: number }
export interface AtomicRateLimitStore {
  consume(key: string, limit: number, interval: number, now: number): Promise<AtomicRateLimitResult>
}

// One Redis command owns initialization, expiry and consumption. / 單一 Redis 指令原子處理初始化、到期與扣額度。
export const REDIS_CONSUME_SCRIPT = `
local now = redis.call('TIME')
local ms = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)
local limit = tonumber(ARGV[1])
local interval = tonumber(ARGV[2])
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], interval) end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then redis.call('PEXPIRE', KEYS[1], interval); ttl = interval end
return { count <= limit and 1 or 0, math.max(0, limit - count), ms + ttl }
`

export function redisRateLimitStore(client: { eval: (script: string, options: { keys: string[]; arguments: string[] }) => Promise<unknown> }, prefix = 'nuxt-security:rate:'): AtomicRateLimitStore {
  return {
    async consume(key, limit, interval) {
      const result = await client.eval(REDIS_CONSUME_SCRIPT, { keys: [prefix + key], arguments: [String(limit), String(interval)] }) as number[]
      if (!Array.isArray(result) || result.length !== 3 || result.some(value => !Number.isFinite(Number(value)))) throw new Error('Invalid atomic rate limit response / 原子限流回應無效')
      return { allowed: Number(result[0]) === 1, remaining: Number(result[1]), reset: Number(result[2]) }
    }
  }
}

const queues = new Map<string, Promise<unknown>>()
/** Serialize local storage operations; Redis provides cross-instance atomicity. / 本機序列化；跨 instance 使用 Redis 原子操作。 */
export async function withRateLimitLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) || Promise.resolve()
  const running = previous.catch(() => {}).then(operation)
  queues.set(key, running)
  try { return await running } finally { if (queues.get(key) === running) queues.delete(key) }
}
