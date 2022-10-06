import { setHeaders, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

// Probably will be removed due to easier working with separate middlewares
const helmConfig = useRuntimeConfig().helm

export default defineEventHandler((event) => {
  setHeaders(event, {
    'Content-Security-Policy': helmConfig.contentSecurityPolicy,
    'Cross-Origin-Resource-Policy': helmConfig.crossOriginResourcePolicy,
    'Cross-Origin-Opener-Policy': helmConfig.crossOriginOpenerPolicy,
    'Cross-Origin-Embedder-Policy': helmConfig.crossOriginEmbedderPolicy,
    'Origin-Agent-Cluster': helmConfig.originAgentCluster,
    'Referrer-Policy': helmConfig.referrerPolicy,
    'Strict-Transport-Security': helmConfig.strictTransportSecurity,
    'X-Content-Type-Options': helmConfig.xContentTypeOptions,
    'X-DNS-Prefetch-Control': helmConfig.xDNSPrefetchControl,
    'X-Download-Options': helmConfig.xDownloadOptions,
    'X-Frame-Options': helmConfig.xFrameOptions,
    'X-Permitted-Cross-Domain-Policies': helmConfig.xPermittedCrossDomainPolicies,
    'X-XSS-Protection': helmConfig.xXSSProtection,
  })
})
