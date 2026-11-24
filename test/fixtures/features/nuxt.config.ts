export default defineNuxtConfig({
  modules: ['../../../src/module'],
  routeRules: { '/static': { prerender: true } },
  security: {
    rateLimiter: false,
    ssg: { dynamicNonce: true },
    byFileExtension: { '.svg': { headers: { contentSecurityPolicy: { 'default-src': ["'none'"] }, xContentTypeOptions: 'nosniff' } } },
    headers: { contentSecurityPolicyReportOnly: { 'script-src': ["'nonce-{{nonce}}'"], 'report-uri': ['/reports'] } }
  }
})
