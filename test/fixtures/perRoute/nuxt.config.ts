export default defineNuxtConfig({
  modules: ['../../../src/module'],
  routeRules: {
    '/**': {
      headers: {
        foo: 'bar',
        'Referrer-Policy': 'no-referrer-when-downgrade'
      }
    },
    '/ignore-all/**': {
      security: {
        headers: false
      }
    },
    '/set-specific/**': {
      security: {
        headers: {
          crossOriginOpenerPolicy: 'same-origin-allow-popups'
        }
      }
    },
    '/ignore-specific/**': {
      security: {
        headers: {
          crossOriginOpenerPolicy: false,
          referrerPolicy: false
        }
      }
    },
    '/merge-recursive/**': {
      security: {
        headers: {
          crossOriginResourcePolicy: false,
          crossOriginOpenerPolicy: undefined,
          crossOriginEmbedderPolicy: 'credentialless'
        }
      }
    },
    'merge-recursive/deep/**': {
      security: {
        headers: {
          crossOriginResourcePolicy: 'same-site',
          crossOriginOpenerPolicy: false
        }
      }
    },
    '/provided-as-standard': {
      headers: {
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Strict-Transport-Security': 'max-age=1; preload;',
        'Permissions-Policy': 'fullscreen=*, camera=(self)',
        'Content-Security-Policy':
          "script-src 'self' https:; media-src 'none';",
        foo: 'baz',
        foo2: 'baz2'
      }
    },
    '/resolve-conflict/**': {
      headers: {
        'Cross-Origin-Resource-Policy': 'same-site',
        'Cross-Origin-Opener-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Strict-Transport-Security': 'max-age=1; preload;',
        'Permissions-Policy': 'fullscreen=*',
        foo: 'baz',
        foo2: 'baz2'
      },
      security: {
        headers: {
          crossOriginOpenerPolicy: false,
          crossOriginEmbedderPolicy: 'credentialless',
          strictTransportSecurity: {
            maxAge: 2,
            preload: false,
            includeSubdomains: false
          },
          permissionsPolicy: {
            camera: ['self'],
            fullscreen: ['self'],
            geolocation: ['*']
          }
        }
      }
    },
    '/resolve-conflict/deep/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Referrer-Policy': 'unsafe-url'
      },
      security: {
        headers: {
          xFrameOptions: false
        }
      }
    },
    '/resolve-conflict/deep/page': {
      headers: {
        'Strict-Transport-Security': 'max-age=1; preload;',
        'X-Frame-Options': 'DENY'
      },
      security: {
        headers: {
          referrerPolicy: 'no-referrer-when-downgrade'
        }
      }
    },

    '/support-deprecated-object/**': {
      headers: {
        //@ts-ignore - Intentional as we test backwards compatibility with a deprecated syntax
        'Cross-Origin-Resource-Policy': false,
        //@ts-ignore - Intentional as we test backwards compatibility with a deprecated syntax
        'Strict-Transport-Security': {
          maxAge: 10,
          includeSubdomains: false,
          preload: true
        },
        //@ts-ignore - Intentional as we test backwards compatibility with a deprecated syntax
        'Content-Security-Policy': {
          'base-uri': false,
          'script-src': "'self'",
          'img-src': ['https:']
        }
      }
    },
    '/support-deprecated-string/**': {
      security: {
        headers: {
          //@ts-ignore - Intentional as we test backwards compatibility with a deprecated syntax
          strictTransportSecurity: 'max-age=10;',
          //@ts-ignore - Intentional as we test backwards compatibility with a deprecated syntax
          contentSecurityPolicy: "manifest-src 'none'; script-src 'self';"
        }
      }
    },
    '/empty-string-remove': {
      headers: {
        'Cross-Origin-Resource-Policy': ''
      },
      security: {
        headers: {
          //@ts-ignore - Intentional as we test depreacted syntax also
          crossOriginEmbedderPolicy: ''
        }
      }
    },
    '/merge-concatenate-array/**': {
      security: {
        headers: {
          permissionsPolicy: {
            'display-capture': ['self']
          },
          contentSecurityPolicy: {
            'img-src': ['https:']
          }
        }
      }
    },
    '/merge-concatenate-array/deep/**': {
      security: {
        headers: {
          permissionsPolicy: {
            'display-capture': ['https://*']
          },
          contentSecurityPolicy: {
            'img-src': ['blob:']
          }
        }
      }
    },
    '/merge-substitute-string/**': {
      security: {
        headers: {
          permissionsPolicy: {
            'display-capture': 'self https://*'
          },
          contentSecurityPolicy: {
            'img-src': 'https: blob:'
          }
        }
      }
    },
    '/merge-substitute-string/deep/**': {
      security: {
        headers: {
          permissionsPolicy: {
            'display-capture': 'self'
          },
          contentSecurityPolicy: {
            'img-src': 'blob:'
          }
        }
      }
    },
    '/csp-nonce/**': {
      security: {
        nonce: false,
        headers: {
          contentSecurityPolicy: {
            'script-src': ["'nonce-{{nonce}}'"]
          }
        }
      }
    },
    '/csp-nonce/deep/enabled': {
      security: {
        nonce: true
      }
    },
    '/csp-hash/**': {
      security: {
        ssg: false
      }
    },
    '/csp-hash/deep/disabled': {
      prerender: true,
      security: {
        ssg: {
          meta: true,
          hashScripts: false
        }
      }
    },
    '/csp-hash/deep/enabled': {
      prerender: true,
      security: {
        ssg: {
          meta: true,
          hashScripts: true
        }
      }
    },
    '/csp-meta/**': {
      security: {
        ssg: false
      }
    },
    '/csp-meta/deep/disabled': {
      prerender: true,
      security: {
        ssg: {
          meta: false,
        }
      }
    },
    '/csp-meta/deep/enabled': {
      prerender: true,
      security: {
        ssg: {
          meta: true,
        }
      }
    },
    '/sri-attribute/**': {
      security: {
        sri: false
      }
    },
    '/sri-attribute/deep/**': {
      security: {
        sri: true
      }
    },
    '/sri-attribute/deep/disabled': {
      security: {
        sri: false
      }
    },
    '/preserve-middleware': {
      security: {
        headers: {
          contentSecurityPolicy: false,
          referrerPolicy: false
        }
      }
    },
    '/remove-deprecated/**': {
      headers: {
        //@ts-ignore - Intentional as we test backwards compatibility with a deprecated syntax
        'Referrer-Policy': false
      },
      security: {
        headers: {
          contentSecurityPolicy: false
        }
      }
    }
  },
  security: {
    headers: {
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
