import { defineNitroPlugin, setResponseHeader, removeResponseHeader, getRouteRules, getResponseHeader } from '#imports'
import { ContentSecurityPolicyValue, type OptionKey } from '../../../types/headers'
import { getNameFromKey, headerStringFromObject } from '../../utils/headers'
import { resolveSecurityRules } from '../utils'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.headers) {
      const headers = { ...rules.headers }
      const nonce = event.context.security?.nonce
      
      if (headers.contentSecurityPolicy) {
        const csp = headers.contentSecurityPolicy
        headers.contentSecurityPolicy = insertNonceInCsp(csp, nonce)
      }

      Object.entries(headers).forEach(([header, value]) => {
        const headerName = getNameFromKey(header as OptionKey)
        if (value === false) {
          const { headers: standardHeaders } = getRouteRules(event)
          const standardHeaderValue = standardHeaders?.[headerName]
          const currentHeaderValue = getResponseHeader(event, headerName)
          if (standardHeaderValue === currentHeaderValue) {
            removeResponseHeader(event, headerName)
          }
        } else {
          const headerValue = headerStringFromObject(header as OptionKey, value)
          setResponseHeader(event, headerName, headerValue)
        }
      })
    }
  })

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