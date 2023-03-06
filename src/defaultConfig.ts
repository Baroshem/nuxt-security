import { ModuleOptions } from './types'

const DEFAULT_GLOBAL_ROUTE = '/**'
const DEFAULT_MIDDLEWARE_ROUTE = ''
const defaultGlobalRoute = { route: DEFAULT_GLOBAL_ROUTE }
const defaultMiddlewareRoute = { route: DEFAULT_MIDDLEWARE_ROUTE }
const defaultThrowErrorValue = { throwError: true }

export const defaultSecurityConfig = (serverlUrl: string): ModuleOptions => ({
  headers: {
    crossOriginResourcePolicy: {
      value: 'same-origin',
      ...defaultGlobalRoute
    },
    crossOriginOpenerPolicy: {
      value: 'same-origin',
      ...defaultGlobalRoute
    },
    crossOriginEmbedderPolicy: {
      value: 'require-corp',
      ...defaultGlobalRoute
    },
    contentSecurityPolicy: {
      value: {
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'upgrade-insecure-requests': true
      },
      ...defaultGlobalRoute
    },
    originAgentCluster: {
      value: '?1',
      ...defaultGlobalRoute
    },
    referrerPolicy: {
      value: 'no-referrer',
      ...defaultGlobalRoute
    },
    strictTransportSecurity: {
      value: {
        maxAge: 15552000,
        includeSubdomains: true
      },
      ...defaultGlobalRoute
    },
    xContentTypeOptions: {
      value: 'nosniff',
      ...defaultGlobalRoute
    },
    xDNSPrefetchControl: {
      value: 'off',
      ...defaultGlobalRoute
    },
    xDownloadOptions: {
      value: 'noopen',
      ...defaultGlobalRoute
    },
    xFrameOptions: {
      value: 'SAMEORIGIN',
      ...defaultGlobalRoute
    },
    xPermittedCrossDomainPolicies: {
      value: 'none',
      ...defaultGlobalRoute
    },
    xXSSProtection: {
      value: '0',
      ...defaultGlobalRoute
    }
  },
  requestSizeLimiter: {
    value: {
      maxRequestSizeInBytes: 2000000,
      maxUploadFileRequestInBytes: 8000000
    },
    ...defaultMiddlewareRoute,
    ...defaultThrowErrorValue
  },
  rateLimiter: {
    // Twitter search rate limiting
    value: {
      tokensPerInterval: 150,
      interval: 'hour',
      fireImmediately: true
    },
    ...defaultMiddlewareRoute,
    ...defaultThrowErrorValue
  },
  xssValidator: {
    value: {},
    ...defaultMiddlewareRoute,
    ...defaultThrowErrorValue,
  },
  // TODO: migrate to native H3 CORS and rename this to `cors`
  corsHandler: {
    // Options by CORS middleware for Express https://github.com/expressjs/cors#configuration-options
    value: {
      origin: serverlUrl as any,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      preflight: {
        statusCode: 204
      }
    },
    ...defaultMiddlewareRoute,
    ...defaultThrowErrorValue
  },
  allowedMethodsRestricter: {
    value: '*',
    ...defaultMiddlewareRoute,
    ...defaultThrowErrorValue
  },
  hidePoweredBy: true,
  basicAuth: false,
  enabled: true,
  csrf: false,
})
