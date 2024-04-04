import { getNameFromKey, headerStringFromObject, headerObjectFromString, getKeyFromName } from "../../utils/headers"
import { createRouter } from "radix3"
import { defineNitroPlugin, setResponseHeader, removeResponseHeader, getRouteRules } from "#imports"
import { ContentSecurityPolicyValue, OptionKey, SecurityHeaders } from "~/src/module"
import { defuReplaceArray } from "../../../utils"
import crypto from 'node:crypto'
import type { H3Event } from "h3"

export default defineNitroPlugin((nitroApp) => {

  const router = createRouter<SecurityHeaders>()

  nitroApp.hooks.hook('nuxt-security:headers', ({ route, headers }) => {
    router.insert(route, headers)
  })


  nitroApp.hooks.hook('request', (event) => {
    console.log('request context', event.path, event)
    const configRouteRules = getRouteRules(event)
    const { security, headers: standardHeaders } = configRouteRules

    if (security?.nonce) {
      const nonce = crypto.randomBytes(16).toString('base64')
      event.context.nonce = nonce
    }

    // STEP 1 - DETECT STANDARD HEADERS THAT MAY OVERLAP WITH SECURITY HEADERS
    // Lookup standard radix headers
    // Detect if they belong to one of the SecurityHeaders
    // And convert them into object format
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
    }

    // STEP 2 - ENSURE BACKWARDS COMPATIBILITY OF SECURITY HEADERS
    // Lookup the Security headers, normally they should be in object format
    // However detect if they were supplied in string format
    // And convert them into object format
    const securityHeadersAsObject: SecurityHeaders = {}

    if (security?.headers) {
      const { headers: securityHeaders } = security
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
    }

    // STEP 3 - RETRIEVE RUNTIME HEADERS
    const runtimeHeaders = router.lookup(event.path) || {}

    // STEP 4 - MERGE STANDARD HEADERS, SECURITY HEADERS AND RUNTIME HEADERS, IN THAT ORDER
    const mergedHeaders = defuReplaceArray(runtimeHeaders, securityHeadersAsObject, standardHeadersAsObject)

    event.context.security = {
      headers: mergedHeaders
    }
  })

  nitroApp.hooks.hook('beforeResponse', (event) => {
    console.log('beforeResponse', event.path, event)
    const nonce = event.context.nonce as string
    const headers = event.context.security.headers
    
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

  nitroApp.hooks.callHook('nuxt-security:ready')
})
