import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

const { z } = createRequire(resolve('docs/package.json'))('zod')
it('rejects oversized schema collections before walking elements / 過大 schema 集合提早拒絕', () => {
  const schema = z.array(z.string().uuid()).max(10)
  expect(schema.safeParse(['00000000-0000-4000-8000-000000000000']).success).toBe(true)
  let reads = 0
  const input = new Proxy(new Array(100000).fill(0), { get(target, key, receiver) {
    if (typeof key === 'string' && /^\d+$/.test(key)) reads++
    return Reflect.get(target, key, receiver)
  } })
  const result = schema.safeParse(input)
  expect(result.success).toBe(false)
  expect(result.error.issues).toHaveLength(1)
  expect(result.error.issues[0].code).toBe('too_big')
  expect(reads).toBe(0)
})
