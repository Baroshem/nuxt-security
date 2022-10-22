import { RateLimiter } from "limiter";
import { defineEventHandler, getRequestHeader, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import cache from 'memory-cache'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler(async (event) => {
  const ip = getRequestHeader(event, 'x-forwarded-for')

  let cachedLimiter;
  if (!cache.get(ip)) {
    // TODO: send rate limiting configuration from the module
    cachedLimiter = new RateLimiter(securityConfig.rateLimiter.value)
    cache.put(ip, cachedLimiter, 10000)
  } else {
    cachedLimiter = cache.get(ip)
    if (cachedLimiter.getTokensRemaining() > 1) {
      cachedLimiter.removeTokens(1)
      cache.put(ip, cachedLimiter, 10000)
    } else {
      throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
    }
  }
})
