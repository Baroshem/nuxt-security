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

export const NAMES_TO_KEYS: Record<HeaderName, OptionKey> = {
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
