[![nuxt-security](https://nuxt-security.vercel.app/preview.png)](https://nuxt-security.vercel.app)

# nuxt-security

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

> Security module for Nuxt based on [OWASP Top 10](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#nodejs-security-cheat-sheet) and [helmet](https://helmetjs.github.io/) that adds security response headers, protection middlewares, CORS, and more.

- [📖 &nbsp;Read the documentation](https://nuxt-security.vercel.app)
- [👾 &nbsp;Playground](https://stackblitz.com/github/baroshem/nuxt-security?file=.stackblitz%2Fnuxt.config.ts)
- [✨ &nbsp;Intro video](https://www.youtube.com/watch?v=8ac30Py8Ses)

## Features

- Nuxt 3 ready
- Security response headers
- Content Security Policy (CSP) for SSG apps
- Request Size & Rate Limiters
- Cross Site Scripting (XSS) Validation
- Cross-Origin Resource Sharing (CORS) support
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

## Static site generation (SSG)

This module is meant to work with SSR apps, but you can also use this module in SSG apps where you will get a Content Security Policy (CSP) support via `<meta http-equiv>` tag. You can find more about configuring Content Security Policy (CSP) [here](https://nuxt-security.vercel.app/security/headers#content-security-policy).

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
