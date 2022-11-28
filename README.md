[![nuxt-security](https://nuxt-security.vercel.app/preview.png)](https://nuxt-security.vercel.app)

# nuxt-security

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> [OWASP Top 10](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#nodejs-security-cheat-sheet) module that adds a few security improvements in form of a customizable server middlewares to your [Nuxt](https://v3.nuxtjs.org) application. All middlewares can be modified or disabled if needed. They can also be configured to work only on certain routes. By default all middlewares are configured to work globally.

- [✨ &nbsp;Release Notes](https://github.com/Baroshem/nuxt-security/releases)
- [📖 &nbsp;Read the documentation](https://nuxt-security.vercel.app)

## Features

- Nuxt 3 ready
- Same Security headers set as by popular Express.js middleware [helmet](https://helmetjs.github.io/)
- Hidden 'X-Powered-By' header
- Request Size Limiter
- Rate Limiter
- XSS Validator for both GET and POST requests
- CORS Handler similar to popular Express.js middleware
- Allowed HTTP Methods Restricter
- Basic Auth support
- TypeScript support

[📖 &nbsp;Read the documentation](https://nuxt-security.vercel.app)

## Preview

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/baroshem/nuxt-security-stackblitz)

## Setup

```sh
yarn add nuxt-security # yarn
npm i nuxt-security # npm
```

## Usage

The only thing you need to do to use the module in the default configuration is to register the module in the `modules` array in `nuxt.config.ts`:

```javascript
// nuxt.config.js

{
  modules: [
    "nuxt-security",
  ],
  security: {} // optional
}
```

The module will configure for you several response headers with the values recommended by Helmet as well as custom middlewares for rate and request limiting, xss validation, and CORS handling. More to come soon!

If you wish to modify them you can do so from the configuration:

```javascript
// nuxt.config.js

{
  modules: [
    "nuxt-security",
  ],
  security: {
    requestSizeLimiter: {
      value: {
        maxRequestSizeInBytes: 3000000,
        maxUploadFileRequestInBytes: 9000000,
      },
      route: '/upload-file'
    }
  }
}
```

For all available configuration options check out the [docs](https://nuxt-security.vercel.app)

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
[codecov-src]: https://img.shields.io/codecov/c/github/baroshem/nuxt-security.svg
[codecov-href]: https://codecov.io/gh/baroshem/nuxt-security
[license-src]: https://img.shields.io/npm/l/nuxt-security.svg
[license-href]: https://npmjs.com/package/nuxt-security
