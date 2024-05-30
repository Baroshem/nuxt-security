import type { ModuleOptions } from './types/module'

const defaultThrowErrorValue = { throwError: true }

export const defaultSecurityConfig = (serverlUrl: string): ModuleOptions => ({
  headers: {
    crossOriginResourcePolicy: 'same-origin',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginEmbedderPolicy: 'require-corp',
    contentSecurityPolicy: {
      'base-uri': ["'none'"],
      'default-src' : ["'self'"],
      'font-src': ["'self'", 'https:', 'data:'],
      'form-action': ["'self'"],
      'frame-ancestors': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'object-src': ["'none'"],
      'script-src-attr': ["'none'"],
      'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      'script-src': ["'self'", 'https:', "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'"],
      'upgrade-insecure-requests': true
    },
    originAgentCluster: '?1',
    referrerPolicy: 'no-referrer',
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubdomains: true
    },
    xContentTypeOptions: 'nosniff',
    xDNSPrefetchControl: 'off',
    xDownloadOptions: 'noopen',
    xFrameOptions: 'DENY',
    xPermittedCrossDomainPolicies: 'none',
    xXSSProtection: '0',
    permissionsPolicy: {
      accelerometer: [],
      'ambient-light-sensor':[],
      autoplay:[],
      battery:[],
      camera:[],
      'display-capture':[],
      'document-domain':[],
      'encrypted-media':[],
      fullscreen:[],
      gamepad:[],
      geolocation:[],
      gyroscope:[],
      'layout-animations':['self'],
      'legacy-image-formats':['self'],
      magnetometer:[],
      microphone:[],
      midi:[],
      'oversized-images':['self'],
      payment:[],
      'picture-in-picture':[],
      'publickey-credentials-get':[],
      'speaker-selection':[],
      'sync-xhr':['self'],
      'unoptimized-images':['self'],
      'unsized-media':['self'],
      usb:[],
      'screen-wake-lock':[],
      'web-share':[],
      'xr-spatial-tracking':[]
    }
  },
  requestSizeLimiter: {
    maxRequestSizeInBytes: 2000000,
    maxUploadFileRequestInBytes: 8000000,
    ...defaultThrowErrorValue
  },
  rateLimiter: {
    // Twitter search rate limiting
    tokensPerInterval: 150,
    interval: 300000,
    headers: false,
    driver: {
      name: 'lruCache'
    },
    ...defaultThrowErrorValue
  },
  xssValidator: {
    methods: ['GET', 'POST'],
    ...defaultThrowErrorValue
  },
  corsHandler: {
    // Options by CORS middleware for Express https://github.com/expressjs/cors#configuration-options
    origin: serverlUrl,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflight: {
      statusCode: 204
    }
  },
  allowedMethodsRestricter: {
    methods: '*',
    ...defaultThrowErrorValue
  },
  hidePoweredBy: true,
  basicAuth: false,
  enabled: true,
  csrf: false,
  nonce: true,
  // https://github.com/Talljack/unplugin-remove/blob/main/src/types.ts
  removeLoggers: {
    external: [],
    consoleType: ['log', 'debug'],
    include: [/\.[jt]sx?$/, /\.vue\??/],
    exclude: [/node_modules/, /\.git/]
  },
  ssg: {
    meta: true,
    hashScripts: true,
    hashStyles: false,
    nitroHeaders: true,
    exportToPresets: true,
  },
  sri: true
})
