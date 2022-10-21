import { RateLimiter } from "limiter";
import { defineEventHandler, getRequestHeader, sendError, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security
const storage = useStorage()

export default defineEventHandler(async (event) => {
  const ip = getRequestHeader(event, 'x-forwarded-for')

  let cachedLimiter;
  if (!await storage.getItem(ip)) {
    // TODO: send rate limiting configuration from the module
    cachedLimiter = new RateLimiter(securityConfig.rateLimiter.value)
    await storage.setItem(ip, cachedLimiter)
  } else {
    cachedLimiter = await storage.getItem(ip)
    if (cachedLimiter.getTokensRemaining() > 1) {
      cachedLimiter.removeTokens(1)
      await storage.setItem(ip, cachedLimiter)
    } else {
      const error = createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
      sendError(event, error)
    }
  }
})
