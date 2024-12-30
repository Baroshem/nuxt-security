export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  routeRules: {
    '/test/**': {
      security: {
        headers: {
          referrerPolicy: 'no-referrer',
          strictTransportSecurity: {
            maxAge: 15552000,
            includeSubdomains: true,
          },
          xContentTypeOptions: 'nosniff',
          xDownloadOptions: 'noopen',
          xFrameOptions: 'SAMEORIGIN',
          xPermittedCrossDomainPolicies: 'none',
          xXSSProtection: '0',
        }
      }
    }
  },
  security: {
    headers: {
      referrerPolicy: false,
      strictTransportSecurity: false,
      xContentTypeOptions: false,
      xDownloadOptions: false,
      xFrameOptions: false,
      xPermittedCrossDomainPolicies: false,
      xXSSProtection: false,
      contentSecurityPolicy: {
        'script-src': [
          "'self'",
          'https:',
          "'unsafe-inline'",
          "'strict-dynamic'"
        ]
      }
    }
  }
})
