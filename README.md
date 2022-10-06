# nuxt-helm

This module is a H3/Nuxt version of the popular Express Middleware [helmet](https://helmetjs.github.io/) or check out the [GitHub Repository](https://github.com/helmetjs/helmet). `nuxt-helm` automatically sets the same response headers for H3 events as a global Nuxt middleware.

## Usage

```sh
yarn add nuxt-helm # yarn
npm i nuxt-helm # npm
```

```javascript
// nuxt.config.js

{
  modules: [
    "nuxt-helm",
  ],
}
```

The module will configure for you several response headers with the values recommended by Helmet.

If you wish to modify them you can do so from the configuration:

```js
 helm: {
  crossOriginResourcePolicy: string | boolean;
  crossOriginOpenerPolicy: string | boolean;
  crossOriginEmbedderPolicy: string | boolean;
  contentSecurityPolicy: string | boolean;
  originAgentCluster: string | boolean;
  referrerPolicy: string | boolean;
  strictTransportSecurity: string | boolean;
  xContentTypeOptions: string | boolean;
  xDNSPrefetchControl: string | boolean;
  xDownloadOptions: string | boolean;
  xFrameOptions: string | boolean;
  xPermittedCrossDomainPolicies: string | boolean;
  xXSSProtection: number | boolean;
  }
```

The default values are as follows:

```js
  helm: {
    crossOriginResourcePolicy: "same-origin",
    crossOriginOpenerPolicy: "same-origin",
    crossOriginEmbedderPolicy: "require-corp",
    contentSecurityPolicy: "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
    originAgentCluster: '?1',
    referrerPolicy: 'no-referrer',
    strictTransportSecurity: 'max-age=15552000; includeSubDomains',
    xContentTypeOptions: 'nosniff',
    xDNSPrefetchControl: 'off',
    xDownloadOptions: 'noopen',
    xFrameOptions: 'SAMEORIGIN',
    xPermittedCrossDomainPolicies: 'none',
    xXSSProtection: 0
  }
```

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.
