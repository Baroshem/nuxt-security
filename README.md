# nuxt-security

[OWASP Top 10](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#nodejs-security-cheat-sheet) module that adds a few security improvements in form of a customizable server middlewares to your Nuxt 3 application. All middlewares can be modified or disabled if needed. They can also be configured to work only on certain routes. By default all middlewares are configured to work globally.

## Features

* Same Security headers set as by popular Express.js middleware [helmet](https://helmetjs.github.io/)
* Request Size Limiter
* Rate Limiter
* XSS Validator for both GET and POST requests
* CORS Handler similar to popular Express.js middlware

## Usage

```sh
yarn add nuxt-security # yarn
npm i nuxt-security # npm
```

```javascript
// nuxt.config.js

{
  modules: [
    "nuxt-security",
  ],
}
```

The module will configure for you several response headers with the values recommended by Helmet as well as two custom middlewares for rate and request size limiting.

If you wish to modify them you can do so from the configuration:

```ts
export interface CorsOptions {
    origin?: '*' | 'null' | (string | RegExp)[] | ((origin: string) => boolean);
    methods?: '*' | HTTPMethod[];
    allowHeaders?: '*' | string[];
    exposeHeaders?: '*' | string[];
    credentials?: boolean;
    maxAge?: string | false;
    preflight?: {
        statusCode?: number;
    };
}

export type RequestSizeLimiter = {
  maxRequestSizeInBytes: number;
  maxUploadFileRequestInBytes: number;
};

export type RateLimiter = {
  tokensPerInterval: number;
  interval: string | number;
  fireImmediately?: boolean;
};

export type MiddlewareConfiguration<MIDDLEWARE> = {
  value: MIDDLEWARE;
  route: string;
}

export type XssValidator = {
  whiteList: Record<string, any>;
  stripIgnoreTag: boolean;
  stripIgnoreTagBody: boolean;
  css: Record<string, any> | boolean;
} | {};

export type SecurityHeaders = {
  crossOriginResourcePolicy: MiddlewareConfiguration<string> | boolean;
  crossOriginOpenerPolicy: MiddlewareConfiguration<string> | boolean;
  crossOriginEmbedderPolicy: MiddlewareConfiguration<string> | boolean;
  contentSecurityPolicy: MiddlewareConfiguration<string> | boolean;
  originAgentCluster: MiddlewareConfiguration<string> | boolean;
  referrerPolicy: MiddlewareConfiguration<string> | boolean;
  strictTransportSecurity: MiddlewareConfiguration<string> | boolean;
  xContentTypeOptions: MiddlewareConfiguration<string> | boolean;
  xDNSPrefetchControl: MiddlewareConfiguration<string> | boolean;
  xDownloadOptions: MiddlewareConfiguration<string> | boolean;
  xFrameOptions: MiddlewareConfiguration<string> | boolean;
  xPermittedCrossDomainPolicies: MiddlewareConfiguration<string> | boolean;
  xXSSProtection: MiddlewareConfiguration<number> | boolean;
};

export interface ModuleOptions {
  headers: SecurityHeaders | boolean;
  requestSizeLimiter: MiddlewareConfiguration<RequestSizeLimiter> | boolean;
  rateLimiter: MiddlewareConfiguration<RateLimiter> | boolean;
  xssValidator: MiddlewareConfiguration<XssValidator> | boolean;
  corsHandler: MiddlewareConfiguration<CorsOptions> | boolean;
}
```

The default values are as follows:

```js
security: {
  headers: {
    crossOriginResourcePolicy: {
      value: "same-origin",
      route: '',
    },
    crossOriginOpenerPolicy: {
      value: "same-origin",
      route: '',
    },
    crossOriginEmbedderPolicy: {
      value: "require-corp",
      route: '',
    },
    contentSecurityPolicy: {
      value:
        "base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
      route: '',
    },
    originAgentCluster: {
      value: "?1",
      route: '',
    },
    referrerPolicy: {
      value: "no-referrer",
      route: '',
    },
    strictTransportSecurity: {
      value: "max-age=15552000; includeSubDomains",
      route: '',
    },
    xContentTypeOptions: {
      value: "nosniff",
      route: '',
    },
    xDNSPrefetchControl: {
      value: "off",
      route: '',
    },
    xDownloadOptions: {
      value: "noopen",
      route: '',
    },
    xFrameOptions: {
      value: "SAMEORIGIN",
      route: '',
    },
    xPermittedCrossDomainPolicies: {
      value: "none",
      route: '',
    },
    xXSSProtection: {
      value: 0,
      route: '',
    },
  },
  requestSizeLimiter: {
    value: {
      maxRequestSizeInBytes: 2000000,
      maxUploadFileRequestInBytes: 8000000,
    },
    route: '',
  },
  rateLimiter: {
    // Twitter search rate limiting
    value: {
      tokensPerInterval: 150,
      interval: "hour",
      fireImmediately: true,
    },
    route: '',
  },
  xssValidator: {
    value: {},
    route: '',
  },
  corsHandler: {
    value: {
      origin: '*',
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      preflight: {
        statusCode: 204
      }
    },
    route: '',
  }
}
```

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.
