
import type { ModuleOptions, NuxtSecurityRouteRules } from "../../../types"
import { createRouter, toRouteMatcher } from "radix3"
import type { H3Event } from "h3"
import { defuReplaceArray } from "../../../../src/utils"

export function resolveSecurityRules(event: H3Event) {
  const routeRules = event.context.security?.routeRules
  const router = createRouter<NuxtSecurityRouteRules>({ routes: routeRules})
  const matcher = toRouteMatcher(router)
  const matches = matcher.matchAll(event.path.split('?')[0])
  const rules = defuReplaceArray({}, ...matches.reverse()) as ModuleOptions
  return rules
}