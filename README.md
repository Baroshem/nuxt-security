[![nuxt-security](https://nuxt-security.vercel.app/preview.png)](https://nuxt-security.vercel.app)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

# Nuxt Security

Automatically configure your app to follow OWASP security patterns and principles by using HTTP Headers and Middleware.

> This module works with Nuxt 3 only

- [📖 &nbsp;Read the documentation](https://nuxt-security.vercel.app)
- [👾 &nbsp;Playground](https://nuxt-security.vercel.app/playground)

## Features

- Security response headers (including CSP for SSG apps)
- Request Size & Rate Limiters
- Cross Site Scripting (XSS) Validation
- Cross-Origin Resource Sharing (CORS) support
- Hide `X-Powered-By` header and remove console loggers utils
- `[Optional]` Allowed HTTP Methods, Basic Auth, CSRF

## Usage

Install the module:

```sh
npm i -D nuxt-security
yarn add -D nuxt-security
pnpm add -D nuxt-security
```

Add the module in the `modules` array in `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: ["nuxt-security"],
})
```

And that's it! The module will now register route rules and server middlewares globally so that your application will be more secured.

## Configuration

You can pass configuration to the module in the `nuxt.config.ts` like following:

```ts
export default defineNuxtConfig({
  modules: ["nuxt-security"],
  security: {
    // options
  }
})
```

For all available configuration options check out the [docs](https://nuxt-security.vercel.app).

## Development

- Run `yarn dev:prepare` to generate type stubs.
- Use `yarn dev` to start playground in development mode.

## License

[MIT License](./LICENSE)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-security/latest.svg
[npm-version-href]: https://npmjs.com/package/nuxt-security
[npm-downloads-src]: https://img.shields.io/npm/dt/nuxt-security.svg
[npm-downloads-href]: https://npmjs.com/package/nuxt-security
[github-actions-ci-src]: https://github.com/baroshem/nuxt-security/actions/workflows/ci.yml/badge.svg
[github-actions-ci-href]: https://github.com/baroshem/nuxt-security/actions?query=workflow%3Aci
[license-src]: https://img.shields.io/npm/l/nuxt-security.svg
[license-href]: https://npmjs.com/package/nuxt-security
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
