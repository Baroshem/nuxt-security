
import type { NuxtSecurityRouteRules } from "../../../types"
import { createRouter, toRouteMatcher } from "radix3"
import type { H3Event } from "h3"
import { createDefu } from 'defu'

export function resolveSecurityRules(event: H3Event) {
  const routeRules = event.context.security?.routeRules
  const router = createRouter<NuxtSecurityRouteRules>({ routes: routeRules})
  const matcher = toRouteMatcher(router)
  const matches = matcher.matchAll(event.path.split('?')[0])
  const rules: NuxtSecurityRouteRules = defuReplaceArray({}, ...matches.reverse())
  return rules
}

export function resolveSecurityRoute(event: H3Event) {
  const routeRules = event.context.security?.routeRules || {}
  const routeNames = Object.fromEntries(Object.entries(routeRules).map(([name]) => [name, { name }]))
  const router = createRouter<{ name: string }>({ routes: routeNames})
  const match = router.lookup(event.path.split('?')[0])
  return match?.name
}

export const defuReplaceArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value
    return true
  }
})
