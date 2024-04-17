import type { H3Event } from 'h3'
import { defineEventHandler, getRequestHeader, createError, setResponseHeader, useStorage } from '#imports'
import type { RateLimiter } from '~/src/module'
import { resolveSecurityRules } from '../../composables/context'

type StorageItem = {
  value: number,
  date: number
}

const storage = useStorage<StorageItem>('#storage-driver')

export default defineEventHandler(async (event) => {
  const rules = resolveSecurityRules(event)

  if (rules?.rateLimiter) {
    const { rateLimiter } = rules
    const ip = getIP(event)

    let storageItem = await storage.getItem(ip) as StorageItem

    if (!storageItem) {
      await setStorageItem(rateLimiter, ip)
    } else {
      if (typeof storageItem !== 'object') { return }

      const timeSinceFirstRateLimit = storageItem.date
      const timeForInterval = storageItem.date + Number(rateLimiter.interval)

      if (Date.now() >= timeForInterval) {
        await setStorageItem(rateLimiter, ip)
        storageItem = await storage.getItem(ip) as StorageItem
      }

      const isLimited = timeSinceFirstRateLimit <= timeForInterval && storageItem.value === 0

      if (isLimited) {
        const tooManyRequestsError = {
          statusCode: 429,
          statusMessage: 'Too Many Requests'
        }

        if (rules.rateLimiter.headers) {
          setResponseHeader(event, 'x-ratelimit-remaining', 0)
          setResponseHeader(event, 'x-ratelimit-limit', rateLimiter.tokensPerInterval)
          setResponseHeader(event, 'x-ratelimit-reset', timeForInterval)
        }

        if (rateLimiter.throwError === false) {
          return tooManyRequestsError
        }
        throw createError(tooManyRequestsError)
      }

      const newItemDate = timeSinceFirstRateLimit > timeForInterval ? Date.now() : storageItem.date

      const newStorageItem: StorageItem = { value: storageItem.value - 1, date: newItemDate }

      await storage.setItem(ip, newStorageItem)
      const currentItem = await storage.getItem(ip)as StorageItem

      if (currentItem && rateLimiter.headers) {
        setResponseHeader(event, 'x-ratelimit-remaining', currentItem.value)
        setResponseHeader(event, 'x-ratelimit-limit', rateLimiter?.tokensPerInterval)
        setResponseHeader(event, 'x-ratelimit-reset', timeForInterval)
      }
    }
  }
})

async function setStorageItem (rateLimiter: RateLimiter, ip: string) {
  const rateLimitedObject: StorageItem = { value: rateLimiter.tokensPerInterval, date: Date.now() }
  await storage.setItem(ip, rateLimitedObject)
}

// Taken and modified from https://github.com/timb-103/nuxt-rate-limit/blob/8a37846469c2f32f0e2ca6893a31baeec944d56c/src/runtime/server/utils/rate-limit.ts#L78
function getIP (event: H3Event) {
  const req = event?.node?.req
  let xForwardedFor = getRequestHeader(event, 'x-forwarded-for')

  if (xForwardedFor === '::1') {
    xForwardedFor = '127.0.0.1'
  }

  const transformedXForwardedFor = xForwardedFor?.split(',')?.pop()?.trim() || ''
  const remoteAddress = req?.socket?.remoteAddress || ''
  let ip = transformedXForwardedFor || remoteAddress

  if (ip) {
    ip = ip.split(':')[0]
  }

  return ip
}
