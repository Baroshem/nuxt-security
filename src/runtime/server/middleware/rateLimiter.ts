import { defineEventHandler, getRequestHeader, createError, setHeader, getRouteRules, useStorage } from '#imports'
import type { H3Event } from 'h3'

type StorageItem = {
  remaining: number,
  startDate: number
}
const storage = useStorage<StorageItem>('#storage-driver')

export default defineEventHandler(async (event) => {
  const routeRules = getRouteRules(event)

  const rateLimiter = routeRules.security.rateLimiter

  if (rateLimiter) {

    const ip = getIP(event)

    let storageItem = await storage.getItem(ip)

    if (!storageItem) {
      await setStorageItem(rateLimiter, ip)
    } else {
      if (typeof storageItem !== 'object') { return }

      const startDate = storageItem.startDate
      const maxDate = startDate + (rateLimiter.interval as number)

      if (Date.now() >= maxDate) {
        await setStorageItem(rateLimiter, ip)
        storageItem = await storage.getItem(ip) as StorageItem
      }

      const isLimited = startDate <= maxDate && storageItem.remaining === 0

      if (isLimited) {
        const tooManyRequestsError = {
          statusCode: 429,
          statusMessage: 'Too Many Requests'
        }

        if (rateLimiter.headers) {
          setHeader(event, 'x-ratelimit-remaining', 0)
          setHeader(event, 'x-ratelimit-limit', rateLimiter.tokensPerInterval as number)
          setHeader(event, 'x-ratelimit-reset', maxDate)
        }

        if (rateLimiter.throwError === false) {
          return tooManyRequestsError
        }
        throw createError(tooManyRequestsError)
      }

      const newItemDate = startDate > maxDate ? Date.now() : storageItem.startDate

      const newStorageItem: StorageItem = { remaining: storageItem.remaining - 1, startDate: newItemDate }

      await storage.setItem(ip, newStorageItem)
      const currentItem = await storage.getItem(ip)as StorageItem

      if (currentItem && rateLimiter.headers) {
        setHeader(event, 'x-ratelimit-remaining', currentItem.remaining)
        setHeader(event, 'x-ratelimit-limit', rateLimiter.tokensPerInterval as number)
        setHeader(event, 'x-ratelimit-reset', maxDate)
      }
    }
  }
})

async function setStorageItem (rateLimiterConfig: any, ip: string) {
  const rateLimitedObject: StorageItem = { remaining: rateLimiterConfig?.tokensPerInterval, startDate: Date.now() }
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
