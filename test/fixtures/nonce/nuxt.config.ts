import MyModule from '../../../src/module'

export default defineNuxtConfig({
  app: {
    // workaround for double loads in ssr when using nonce
    // see: https://github.com/unjs/unhead/issues/136
    head: () => (process.server
      ? {
          script: [
            { src: '/loader.js' },
            { src: '/api/generated-script' },
            { innerHTML: 'var inlineLiteral = \'<script>console.log("example")</script>\'' }
          ]
        }
      : {})
  },

  modules: [
    MyModule
  ],

  routeRules: {
    '/api/generated-script': {
      security: {
        nonce: { mode: 'check' }
      }
    },
    '/api/nonce-exempt': {
      security: {
        nonce: false
      }
    }
  },
  security: {
    nonce: true,
    headers: {
      contentSecurityPolicy: {
        'style-src': ["'self'", "'nonce-{{nonce}}'"],
        'script-src': [
          "'self'", // backwards compatibility for older browsers that don't support strict-dynamic
          "'nonce-{{nonce}}'",
          "'strict-dynamic'"
        ],
        'script-src-attr': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"]
      }
    }
  }
})
