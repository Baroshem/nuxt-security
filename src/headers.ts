import {
  ContentSecurityPolicyValue,
  MiddlewareConfiguration,
  PermissionsPolicyValue,
  SecurityHeaders,
  StrictTransportSecurityValue
} from './types'

type SecurityHeaderNames = Record<string, string>

export const SECURITY_HEADER_NAMES: SecurityHeaderNames = {
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

const headerValueMappers = {
  strictTransportSecurity: (value: StrictTransportSecurityValue) =>
    [
      `max-age=${value.maxAge}`,
      value.includeSubdomains && 'includeSubDomains',
      value.preload && 'preload'
    ].filter(Boolean).join('; '),
  contentSecurityPolicy: (value: ContentSecurityPolicyValue) => {
    return Object.entries(value).map(([directive, sources]) => {
      if (directive === 'upgrade-insecure-requests') {
        return sources ? 'upgrade-insecure-requests' : ''
      }
      return (sources as string[])?.length && `${directive} ${(sources as string[]).join(' ')}`
    })
      .filter(Boolean).join('; ')
  },
  permissionsPolicy: (value: PermissionsPolicyValue) =>
    Object.entries(value)
      .map(
        ([directive, sources]) =>
          (sources as string[])?.length &&
          `${directive}=(${(sources as string[]).join(' ')})`
      )
      .filter(Boolean)
      .join(', ')
}

export const getHeaderValueFromOptions = <T>(headerType: keyof SecurityHeaders, headerOptions: MiddlewareConfiguration<T>) => {
  if (typeof headerOptions.value === 'string') {
    return headerOptions.value
  }
  return headerValueMappers[headerType]?.(headerOptions) ?? headerOptions
}
