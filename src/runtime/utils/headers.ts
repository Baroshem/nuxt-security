import type {
  ContentSecurityPolicyValue,
  PermissionsPolicyValue,
  StrictTransportSecurityValue,
  OptionKey,
  HeaderName,
  SecurityHeaders
} from '../../types/headers'

export const KEYS_TO_NAMES: Record<OptionKey, HeaderName> = {
  contentSecurityPolicy: 'Content-Security-Policy',
  crossOriginEmbedderPolicy: 'Cross-Origin-Embedder-Policy',
  crossOriginOpenerPolicy: 'Cross-Origin-Opener-Policy',
  crossOriginResourcePolicy: 'Cross-Origin-Resource-Policy',
  originAgentCluster: 'Origin-Agent-Cluster',
  referrerPolicy: 'Referrer-Policy',
  strictTransportSecurity: 'Strict-Transport-Security',
  xContentTypeOptions: 'X-Content-Type-Options',
  xDNSPrefetchControl: 'X-DNS-Prefetch-Control',
  xDownloadOptions: 'X-Download-Options',
  xFrameOptions: 'X-Frame-Options',
  xPermittedCrossDomainPolicies: 'X-Permitted-Cross-Domain-Policies',
  xXSSProtection: 'X-XSS-Protection',
  permissionsPolicy: 'Permissions-Policy'
}

const NAMES_TO_KEYS = Object.fromEntries(Object.entries(KEYS_TO_NAMES).map(([key, name]) => ([name, key]))) as Record<HeaderName, OptionKey>

/**
 * 
 * Converts a valid OptionKey into its corresponding standard header name
 */
export function getNameFromKey(key: OptionKey) {
  return KEYS_TO_NAMES[key]
}

/**
 * 
 * Converts a standard header name to its corresponding OptionKey name, or undefined if not found 
 */
export function getKeyFromName(headerName: string) {
  const [, key] = Object.entries(NAMES_TO_KEYS).find(([name]) => name.toLowerCase() === headerName.toLowerCase()) || []
  return key
}

/**
 * 
 * Gigen a valid OptionKey, converts a header object value into its corresponding string format 
 */
export function headerStringFromObject(optionKey: OptionKey, optionValue: Exclude<SecurityHeaders[OptionKey], undefined>) {
  // False value translates into empty header
  if (optionValue === false) {
    return ''
  }
  // Detect if we are in one of the three object cases and stringify them
  if (optionKey === 'contentSecurityPolicy') {
    const policies = optionValue as ContentSecurityPolicyValue
    return Object.entries(policies)
      .filter(([, value]) => value !== false)
      .map(([directive, sources]) => {
        if (directive === 'upgrade-insecure-requests') {
          return 'upgrade-insecure-requests;'
        } else {
          const stringifiedSources = (typeof sources === 'string')
            ? sources
            : (sources as string[])
              .map(source => source.trim())
              .join(' ')
          return `${directive} ${stringifiedSources};`
        }
      })
      .join(' ')

  } else if (optionKey === 'strictTransportSecurity') {
    const policies = optionValue as StrictTransportSecurityValue
    return [
      `max-age=${policies.maxAge};`,
      policies.includeSubdomains && 'includeSubDomains;',
      policies.preload && 'preload;'
    ].filter(Boolean).join(' ')
  
  } else if (optionKey === 'permissionsPolicy') {
    const policies = optionValue as PermissionsPolicyValue
    return Object.entries(policies)
      .filter(([, value]) => value !== false)
      .map(([directive, sources]) => {
        if (typeof sources === 'string') {
          return `${directive}=${sources}`
        } else {
          return `${directive}=(${(sources as string[]).join(' ')})`
        }
      })
      .join(', ')

  } else {
    // Fallback: all other fields are already in string format
    return optionValue as string
  }
}

/**
 * 
 * Given a valid OptionKey, converts a header value string into its corresponding object format
 */
export function headerObjectFromString(optionKey: OptionKey, headerValue: string) {
  // Empty string should remove header
  if (!headerValue) {
    return false
  }
  // Detect if we are in one of the three cases for object format, and objectify them
  if (optionKey === 'contentSecurityPolicy') {
    const directives = headerValue.split(';').map(directive => directive.trim()).filter(directive => directive)
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
    const directives = headerValue.split(';').map(directive => directive.trim()).filter(directive => directive)
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
    const directives = headerValue.split(',').map(directive => directive.trim()).filter(directive => directive)
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
