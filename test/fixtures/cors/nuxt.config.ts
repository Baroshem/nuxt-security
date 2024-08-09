export default defineNuxtConfig({
  modules: [
    '../../../src/module'
  ],
  security: {
  },
  routeRules: {
    '/empty': {
      security: {
        corsHandler: {
          origin: ''
        }
      }
    },
    '/star': {
      security: {
        corsHandler: {
          origin: '*'
        }
      }
    },
    '/single': {
      security: {
        corsHandler: {
          origin: 'https://example.com'
        }
      }
    },
    '/multi': {
      security: {
        corsHandler: {
          origin: ['https://a.example.com', 'https://b.example.com']
        }
      }
    },
    '/regexp-single': {
      security: {
        corsHandler: {
          origin: '(a|b)\\.example\\.com',
          useRegExp: true
        }
      }
    },
    '/regexp-multi': {
      security: {
        corsHandler: {
          origin: ['(a|b)\.example\.com', '(.*)\\.foo.example\\.com'],
          useRegExp: true
        }
      }
    },
  }
})
