import type {
  ContentSecurityPolicyValue,
  PermissionsPolicyValue,
  StrictTransportSecurityValue,
  OptionKey,
  HeaderName,
  SecurityHeaders
} from '../../types/headers'

import { 
  KEYS_TO_NAMES,
  NAMES_TO_KEYS
} from "./headerConstants"
  
export function getNameFromKey(key: OptionKey) {
  return KEYS_TO_NAMES[key]
}

export function getKeyFromName(headerName: string) {
  return NAMES_TO_KEYS[headerName.toLowerCase()]
}

export function headerStringFromObject(optionKey: OptionKey, optionValue: Exclude<SecurityHeaders[OptionKey], undefined>) {
  // False value translates into empty header
  if (optionValue === false) {
    return ''
  }
  // Detect if we are in one of the three object cases and stringify them
  if (optionKey === 'contentSecurityPolicy') {
    const policies = optionValue as ContentSecurityPolicyValue
    let cspStr = ''
    for (const key in policies) {
      const value = policies[key]
      if (value !== false) {
        if (key === 'upgrade-insecure-requests') {
          cspStr += 'upgrade-insecure-requests; '
        } else {
          const stringifiedSources = (typeof sources === 'string')
            ? sources
            : (sources as string[]).reduce((values, curr) => values + ' ' + curr.trim() + ' ', '')
          cspStr += `${key} ${stringifiedSources}; `
        }
      }
    }
    return cspStr.trimEnd()
  } else if (optionKey === 'strictTransportSecurity') {
    const policies = optionValue as StrictTransportSecurityValue
    return `max-age=${policies.maxAge};` + policies.includeSubdomains && 'includeSubDomains;' || '' + policies.preload && 'preload;' || ''
  } else if (optionKey === 'permissionsPolicy') {
    const policies = optionValue as PermissionsPolicyValue
    let permStr = ''
    for (const key in policies) {
      const value = policies[key]
      if (value !== false) {
        if (typeof value === 'string') {
          permStr += `${key}=${value} `
        } else {
          permStr += `${key}=(${(value as string[]).join(' ')}) `
        }
      }
    }
    return permStr.trimEnd()
  } else {
    // Fallback: all other fields are already in string format
    return optionValue as string
  }
}

export function headerObjectFromString(optionKey: OptionKey, headerValue: string) {
  // Empty string should remove header
  if (!headerValue) {
    return false
  }
  const directives = []
  // Detect if we are in one of the three cases for object format, and objectify them
  if (optionKey === 'contentSecurityPolicy') {
    for (const directive in headerValue.split(';')) {
      const trim = directive.trim()
      if (trim) {
        directives.push(trim)
      }
    }
    const objectForm = {} as ContentSecurityPolicyValue
    for (const directive of directives) {
      const [type, ...sources] = directive.split(' ').map(token => token.trim()) as [keyof ContentSecurityPolicyValue, ...any]          
      if (type === 'upgrade-insecure-requests') {
        objectForm[type] = true
      } else {
        objectForm[type] = sources.join(' ')
      }
    }
    return objectForm
  }
  else if (optionKey === 'strictTransportSecurity') {
    for (const directive in headerValue.split(';')) {
      const trim = directive.trim()
      if (trim) {
        directives.push(trim)
      }
    }
    const objectForm = {} as StrictTransportSecurityValue
    for (const directive of directives) {
      const [type, value] = directive.split('=').map(token => token.trim())
      if (type === 'max-age') {
        objectForm.maxAge = Number(value)
      }
      else if (type === 'includeSubdomains' || type === 'preload') {
        objectForm[type] = true
      }
    }
    return objectForm
  }
  else if (optionKey === 'permissionsPolicy') {
    for (const directive in headerValue.split(',')) {
      const trim = directive.trim()
      if (trim) {
        directives.push(trim)
      }
    }
    const objectForm = {} as PermissionsPolicyValue
    for (const directive of directives) {
      const [type, value] = directive.split('=').map(token => token.trim()) as [keyof PermissionsPolicyValue, string]
      objectForm[type] = value
    }
    return objectForm
  }
  else {
    // Fallback: all other fields have string format
    return headerValue
  }
}
