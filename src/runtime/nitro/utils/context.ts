
import type { NuxtSecurityRouteRules } from "../../../types"
import { defuReplaceArray } from "../../../utils"
import { createRouter, toRouteMatcher } from "radix3"
import type { H3Event } from "h3"
import { useNitroApp } from "#imports"

export async function resolveSecurityRules(event: H3Event) {
  const routeRules = event.context.security?.routeRules
  const router = createRouter<NuxtSecurityRouteRules>({ routes: routeRules})
  const matcher = toRouteMatcher(router)
  const matches = matcher.matchAll(event.path.split('?')[0])
  const rules: NuxtSecurityRouteRules = defuReplaceArray({}, ...matches.reverse())
  const nitroApp = useNitroApp()
  await nitroApp.hooks.callHook('nuxt-security:rules', rules)
  return rules
}