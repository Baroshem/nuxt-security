import { RateLimiter } from "limiter";
import { defineEventHandler, getRequestHeader, createError } from "h3";
import cache from "memory-cache";
import { getRouteRules } from "#imports";
export default defineEventHandler(async (event) => {
  const ip = getRequestHeader(event, "x-forwarded-for");
  const routeRules = getRouteRules(event);
  if (routeRules.security.rateLimiter !== false) {
    if (!cache.get(ip)) {
      const cachedLimiter = new RateLimiter(routeRules.security.rateLimiter);
      cache.put(ip, cachedLimiter, 1e4);
    } else {
      const cachedLimiter = cache.get(ip);
      if (cachedLimiter.getTokensRemaining() > 1) {
        await cachedLimiter.removeTokens(1);
        cache.put(ip, cachedLimiter, 1e4);
      } else {
        const tooManyRequestsError = {
          statusCode: 429,
          statusMessage: "Too Many Requests"
        };
        if (routeRules.security.rateLimiter.throwError === false) {
          return tooManyRequestsError;
        }
        throw createError(tooManyRequestsError);
      }
    }
  }
});
