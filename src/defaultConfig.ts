import { ModuleOptions } from "./types";

const DEFAULT_GLOBAL_ROUTE = "";
const defaultRoute = { route: DEFAULT_GLOBAL_ROUTE };

export const defaultSecurityConfig: ModuleOptions = {
  headers: {
    crossOriginResourcePolicy: {
      value: "same-origin",
      ...defaultRoute,
    },
    crossOriginOpenerPolicy: {
      value: "same-origin",
      ...defaultRoute,
    },
    crossOriginEmbedderPolicy: {
      value: "require-corp",
      ...defaultRoute,
    },
    contentSecurityPolicy: {
      value:
        "base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
      ...defaultRoute,
    },
    originAgentCluster: {
      value: "?1",
      ...defaultRoute,
    },
    referrerPolicy: {
      value: "no-referrer",
      ...defaultRoute,
    },
    strictTransportSecurity: {
      value: "max-age=15552000; includeSubDomains",
      ...defaultRoute,
    },
    xContentTypeOptions: {
      value: "nosniff",
      ...defaultRoute,
    },
    xDNSPrefetchControl: {
      value: "off",
      ...defaultRoute,
    },
    xDownloadOptions: {
      value: "noopen",
      ...defaultRoute,
    },
    xFrameOptions: {
      value: "SAMEORIGIN",
      ...defaultRoute,
    },
    xPermittedCrossDomainPolicies: {
      value: "none",
      ...defaultRoute,
    },
    xXSSProtection: {
      value: 0,
      ...defaultRoute,
    },
  },
  requestSizeLimiter: {
    value: {
      maxRequestSizeInBytes: 2000000,
      maxUploadFileRequestInBytes: 8000000,
    },
    ...defaultRoute,
  },
  rateLimiter: {
    // Twitter search rate limiting
    value: {
      tokensPerInterval: 150,
      interval: "hour",
      fireImmediately: true,
    },
    ...defaultRoute,
  },
  xssValidator: {
    value: {},
    ...defaultRoute,
  },
  corsHandler: {
    // Options by CORS middleware for Express https://github.com/expressjs/cors#configuration-options
    value: {
      origin: '*',
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      preflight: {
        statusCode: 204
      }
    },
    ...defaultRoute,
  }
};
