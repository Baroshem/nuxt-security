import type { NuxtSecurityRouteRules } from "~/src/types"
import { createRouter, toRouteMatcher } from "radix3"
import type { H3Event } from "h3"
import { defuReplaceArray } from "../utils"

// This is the global singleton that holds all of the application security rules
const nitroAppSecurityOptions: Record<string, NuxtSecurityRouteRules> = {}

/**
 * Returns all the security rules of the Nitro application
 */
export function getAppSecurityOptions() {
  return nitroAppSecurityOptions
}

/**
 * Returns the security rules applicable to a specific request
 */
export function resolveSecurityRules(event: H3Event): NuxtSecurityRouteRules {
  if (!event.context.security) {
    event.context.security = {}
  }
  if (!event.context.security.rules) {
    const router = createRouter<NuxtSecurityRouteRules>({ routes: structuredClone(nitroAppSecurityOptions) })
    const matcher = toRouteMatcher(router)
    const matches = matcher.matchAll(event.path.split('?')[0])
    const rules: NuxtSecurityRouteRules = defuReplaceArray({}, ...matches.reverse())
    event.context.security.rules = rules
  }
  return event.context.security.rules
}

/**
 * Returns the security route that was matched for a specific request 
 */
export function resolveSecurityRoute(event: H3Event) {
  if (!event.context.security) {
    event.context.security = {}
  }
  if (!event.context.security.route) {
    const routeNames = Object.fromEntries(Object.entries(nitroAppSecurityOptions).map(([name]) => [name, { name }]))
    const router = createRouter<{ name: string }>({ routes: routeNames})
    const match = router.lookup(event.path.split('?')[0])
    const route = match?.name ?? ''
    event.context.security.route = route
  }
  return event.context.security.route
}



