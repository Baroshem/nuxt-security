import {
  ContentSecurityPolicyValue,
  PermissionsPolicyValue,
  StrictTransportSecurityValue
} from './types/headers'

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

export type HeaderMapper = 'strictTransportSecurity' | 'contentSecurityPolicy' | 'permissionsPolicy'

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
  permissionsPolicy: (value: PermissionsPolicyValue) => Object.entries(value).map(([directive, sources]) => `${directive}=(${(sources as string[]).join(' ')})`).filter(Boolean).join(', ')
}

export const getHeaderValueFromOptions = <T>(headerType: HeaderMapper, headerOptions: any) => {
  if (typeof headerOptions === 'string') {
    return headerOptions
  }
  return headerValueMappers[headerType]?.(headerOptions) ?? headerOptions
}
