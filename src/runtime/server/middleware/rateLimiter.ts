import type { H3Event } from 'h3'
import { defineEventHandler, getRequestHeader, createError, setHeader, getRouteRules, useStorage } from '#imports'

type StorageItem = {
  value: number,
  date: number
}
const storage = useStorage<StorageItem>('#storage-driver')

/*
// We don't need to mount the storage here anymore
// Because we know defined #storage-driver explicitely in the nitro:config hook of module.ts
// Instead of inline the config
const driverConfig = useRuntimeConfig().security.rateLimiter.driver
const driver = storageDriver(driverConfig.options)
const storage = createStorage({ driver }).mount('', driver)
*/

export default defineEventHandler(async (event) => {
  const routeRules = getRouteRules(event)

  const rateLimiterConfig = routeRules.security.rateLimiter

  if (rateLimiterConfig !== false) {
    const ip = getIP(event)

    let storageItem = await storage.getItem(ip)

    if (!storageItem) {
      await setStorageItem(rateLimiterConfig, ip)
    } else {
      if (typeof storageItem !== 'object') { return }

      const timeSinceFirstRateLimit = storageItem.date
      const timeForInterval = storageItem.date + rateLimiterConfig?.interval

      if (Date.now() >= timeForInterval) {
        await setStorageItem(rateLimiterConfig, ip)
        storageItem = await storage.getItem(ip) as StorageItem
      }

      const isLimited = timeSinceFirstRateLimit <= timeForInterval && storageItem.value === 0

      if (isLimited) {
        const tooManyRequestsError = {
          statusCode: 429,
          statusMessage: 'Too Many Requests'
        }

        if (rateLimiterConfig.headers) {
          setHeader(event, 'x-ratelimit-remaining', 0)
          setHeader(event, 'x-ratelimit-limit', rateLimiterConfig?.tokensPerInterval)
          setHeader(event, 'x-ratelimit-reset', timeForInterval)
        }

        if (rateLimiterConfig.throwError === false) {
          return tooManyRequestsError
        }
        throw createError(tooManyRequestsError)
      }

      const newItemDate = timeSinceFirstRateLimit > timeForInterval ? Date.now() : storageItem.date

      const newStorageItem: StorageItem = { value: storageItem.value - 1, date: newItemDate }

      await storage.setItem(ip, newStorageItem)
      const currentItem = await storage.getItem(ip)as StorageItem

      if (currentItem && rateLimiterConfig.headers) {
        setHeader(event, 'x-ratelimit-remaining', currentItem.value)
        setHeader(event, 'x-ratelimit-limit', rateLimiterConfig?.tokensPerInterval)
        setHeader(event, 'x-ratelimit-reset', timeForInterval)
      }
    }
  }
})

async function setStorageItem (rateLimiterConfig: any, ip: string) {
  const rateLimitedObject: StorageItem = { value: rateLimiterConfig?.tokensPerInterval, date: Date.now() }
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
