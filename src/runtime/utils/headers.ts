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

const NAMES_TO_KEYS: Record<HeaderName, OptionKey> = {
  'content-security-policy': 'contentSecurityPolicy',
  'cross-origin-embedder-policy': 'crossOriginEmbedderPolicy',
  'cross-origin-opener-policy': 'crossOriginOpenerPolicy',
  'cross-origin-resource-policy': 'crossOriginResourcePolicy',
  'origin-agent-Cluster': 'originAgentCluster',
  'referrer-policy': 'referrerPolicy',
  'strict-transport-security': 'strictTransportSecurity',
  'x-content-type-options': 'xContentTypeOptions',
  'x-dns-prefetch-control': 'xDNSPrefetchControl',
  'x-download-options': 'xDownloadOptions',
  'x-frame-options': 'xFrameOptions',
  'x-permitted-cross-domain-policies': 'xPermittedCrossDomainPolicies',
  'x-xss-protection': 'xXSSProtection',
  'permissions-policy': 'permissionsPolicy'
};

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
  // Detect if we are in one of the three cases for object format, and objectify them
  if (optionKey === 'contentSecurityPolicy') {
    const directives = headerValue.split(';').reduce((values, directive) => {
      directive = directive.trim()
      if (directive) {
        values.push(directive)
      }
      return values
    }, [])
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
    const directives = headerValue.split(';').reduce((values, directive) => {
      directive = directive.trim()
      if (directive) {
        values.push(directive)
      }
      return values
    }, [])
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
    const directives = headerValue.split(',').reduce((values, directive) => {
      directive = directive.trim()
      if (directive) {
        values.push(directive)
      }
      return values
    }, [])
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
