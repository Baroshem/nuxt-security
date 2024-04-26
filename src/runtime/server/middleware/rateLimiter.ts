import type { H3Event } from 'h3'
import { defineEventHandler, createError, setResponseHeader, useStorage, getRequestIP } from '#imports'
import type { RateLimiter } from '~/src/module'
import { resolveSecurityRoute, resolveSecurityRules } from '../../nitro/utils'

type StorageItem = {
  value: number,
  date: number
}

const storage = useStorage<StorageItem>('#rate-limiter-storage')

export default defineEventHandler(async(event) => {
  // Disable rate limiter in prerender mode
  if (import.meta.prerender) { 
    return 
  }

  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.rateLimiter) {
    const { rateLimiter } = rules
    const ip = getIP(event)
    const route = getRoute(event)
    const url = ip + route

    let storageItem = await storage.getItem(url) as StorageItem

    if (!storageItem) {
      await setStorageItem(rateLimiter, url)
    } else {
      if (typeof storageItem !== 'object') { return }

      const timeSinceFirstRateLimit = storageItem.date
      const timeForInterval = storageItem.date + Number(rateLimiter.interval)

      if (Date.now() >= timeForInterval) {
        await setStorageItem(rateLimiter, url)
        storageItem = await storage.getItem(url) as StorageItem
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

      await storage.setItem(url, newStorageItem)
      const currentItem = await storage.getItem(url)as StorageItem

      if (currentItem && rateLimiter.headers) {
        setResponseHeader(event, 'x-ratelimit-remaining', currentItem.value)
        setResponseHeader(event, 'x-ratelimit-limit', rateLimiter?.tokensPerInterval)
        setResponseHeader(event, 'x-ratelimit-reset', timeForInterval)
      }
    }
  }
})

async function setStorageItem(rateLimiter: Omit<RateLimiter, 'driver'>, url: string) {
  const rateLimitedObject: StorageItem = { value: rateLimiter.tokensPerInterval, date: Date.now() }
  await storage.setItem(url, rateLimitedObject)
}

function getIP (event: H3Event) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || ''
  return ip
}

function getRoute(event: H3Event) {
  const route = resolveSecurityRoute(event) || ''
  return route
}
