import { getNameFromKey, headerStringFromObject, headerObjectFromString, getKeyFromName } from "../../utils/headers"
import { createRouter, toRouteMatcher } from "radix3"
import { defineNitroPlugin, setResponseHeader, removeResponseHeader, getRouteRules, useRuntimeConfig } from "#imports"
import { ContentSecurityPolicyValue, OptionKey, SecurityHeaders, NuxtSecurityRouteRules } from "~/src/module"
import { defuReplaceArray } from "../../../utils"
import crypto from 'node:crypto'
import type { H3Event } from "h3"
import { Nuxt } from "@nuxt/schema"
import defu from "defu"

function standardToSecurity(standardHeaders?: Record<string, any>) {
  const standardHeadersAsObject: SecurityHeaders = {}

  if (standardHeaders) {
    Object.entries(standardHeaders).forEach(([headerName, headerValue])  => {
      const optionKey = getKeyFromName(headerName)
      if (optionKey) {
        if (typeof headerValue === 'string') {
          // Normally, standard radix headers should be supplied as string
          const objectValue: any = headerObjectFromString(optionKey, headerValue)
          standardHeadersAsObject[optionKey] = objectValue
        } else {
          // Here we ensure backwards compatibility 
          // Because in the pre-rc1 syntax, standard headers could also be supplied in object format
          standardHeadersAsObject[optionKey] = headerValue
          standardHeaders[headerName] = headerStringFromObject(optionKey, headerValue)
        }
      }
    })
    return standardHeadersAsObject
  } else {
    return undefined
  }
}

function backwardsCompatibleSecurity(securityHeaders?: SecurityHeaders) {
    const securityHeadersAsObject: SecurityHeaders = {}

    if (securityHeaders) {
      Object.entries(securityHeaders).forEach(([key, value]) => {
        const optionKey = key as OptionKey
        if ((optionKey === 'contentSecurityPolicy' || optionKey === 'permissionsPolicy' || optionKey === 'strictTransportSecurity') && (typeof value === 'string')) {
          // Altough this does not make sense in post-rc1 typescript definitions
          // It was possible before rc1 though, so let's ensure backwards compatibility here
          const objectValue: any = headerObjectFromString(optionKey, value)
          securityHeadersAsObject[optionKey] = objectValue
        } else if (value === '') {
          securityHeadersAsObject[optionKey] = false
        } else {
          securityHeadersAsObject[optionKey] = value
        }
      })
      return securityHeadersAsObject
    } else {
      return undefined
    }
}

function insertNonceInCsp(csp: ContentSecurityPolicyValue, nonce?: string) {
  const generatedCsp = Object.fromEntries(Object.entries(csp).map(([directive, value]) => {
    // Return boolean values unchanged
    if (typeof value === 'boolean') {
      return [directive, value]
    }
    // Make sure nonce placeholders are eliminated
    const sources = (typeof value === 'string') ? value.split(' ').map(token => token.trim()).filter(token => token) : value
    const modifiedSources = sources
      .filter(source => !source.startsWith("'nonce-") || source === "'nonce-{{nonce}}'")
      .map(source => {
        if (source === "'nonce-{{nonce}}'") {
          return nonce ? `'nonce-${nonce}'` : ''
        } else {
          return source
        }
      })
      .filter(source => source)

    return [directive, modifiedSources]
  }))
  return generatedCsp as ContentSecurityPolicyValue
}

export default defineNitroPlugin((nitroApp) => {

  const config = useRuntimeConfig()

  const securityRouteRules: Record<string, Partial<NuxtSecurityRouteRules>> = {}
  // TO DO: CHECK POTENTIAL POLLUTION OF HEADERS OBJECT HERE

  // First insert standard route rules headers
  for (const route in config.nitro.routeRules) {
    const rule = config.nitro.routeRules[route]
    const { headers } = rule
    const securityHeaders = standardToSecurity(headers)
    securityRouteRules[route] = { headers: securityHeaders }
  }


  // Then insert global security config
  const securityOptions = config.security
  securityRouteRules['/**'] = securityOptions
  //securityRouteRules['/api/**'] = { headers: false }
  //securityRouteRules['/_nuxt/**'] = { headers: false }


  // Then insert route specific security headers
  for (const route in config.nitro.routeRules) {
    const rule = config.nitro.routeRules[route]
    const { security } = rule
    if (security) {
      const { headers } = security
      if (headers) {
        const securityHeaders = backwardsCompatibleSecurity(headers)
        securityRouteRules[route] = defu(
          { headers: securityHeaders },
          securityRouteRules[route],
        )
      }
    }
  }

  const router = createRouter<Partial<NuxtSecurityRouteRules>>({
    routes: securityRouteRules,
  })


  nitroApp.hooks.hook('nuxt-security:headers', ({ route, headers }) => {
    securityRouteRules[route] = defu(
      { headers },
      securityRouteRules[route]
    )
    router.insert(route, securityRouteRules[route])
  })


  nitroApp.hooks.hook('request', (event) => {

    const matcher = toRouteMatcher(router)
    const matches = matcher.matchAll(event.path)
    const rules: Partial<NuxtSecurityRouteRules> = defu({}, ...matches.reverse())

    event.context.security = { rules }

    if (rules.nonce) {
      const nonce = crypto.randomBytes(16).toString('base64')
      event.context.security.nonce = nonce
    }

    console.log('request', event.path, event.context.security.nonce, event.context.security.rules)

  })
/*
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    //console.log('render:response', event.path, event.context.security.counter, event.context.security.nonce, event.context.security.rules.headers)
  })
*/
  nitroApp.hooks.hook('render:response', (response, { event }) => {

    const nonce = event.context.security.nonce
    const headers = { ...event.context.security.rules.headers }
    console.log('render:response', event.path, nonce, headers)
    
    if (headers && headers.contentSecurityPolicy) {
      const csp = headers.contentSecurityPolicy
      headers.contentSecurityPolicy = insertNonceInCsp(csp, nonce)
    }
    if (headers) {
      Object.entries(headers).forEach(([header, value]) => {
        const headerName = getNameFromKey(header as OptionKey)
        if (value === false) {
          removeResponseHeader(event, headerName)
        } else {
          const headerValue = headerStringFromObject(header as OptionKey, value)
          setResponseHeader(event, headerName, headerValue)
        }
      })
    }
  })

  nitroApp.hooks.callHook('nuxt-security:ready')
})
