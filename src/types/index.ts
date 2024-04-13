import type { ModuleOptions as CsrfOptions } from 'nuxt-csurf'
import type { Options as RemoveOptions } from 'unplugin-remove/types'
import type { SecurityHeaders } from './headers'
import type { AllowedHTTPMethods, BasicAuth, RateLimiter, RequestSizeLimiter, XssValidator, CorsOptions } from './middlewares'

export type Ssg = {
  meta?: boolean;
  hashScripts?: boolean;
  hashStyles?: boolean;
};

export interface ModuleOptions {
  headers: SecurityHeaders | false;
  requestSizeLimiter: RequestSizeLimiter | false;
  rateLimiter: RateLimiter | false;
  xssValidator: XssValidator | false;
  corsHandler: CorsOptions | false;
  allowedMethodsRestricter: AllowedHTTPMethods | false;
  hidePoweredBy: boolean;
  basicAuth: BasicAuth | false;
  enabled: boolean;
  csrf: CsrfOptions | boolean;
  nonce: boolean;
  removeLoggers: RemoveOptions | false;
  ssg: Ssg | false;
  /**
   * enable runtime nitro hooks to configure some options at runtime
   * Current configuration editable at runtime: headers
   */
  runtimeHooks: boolean;
  sri: boolean
}

export type NuxtSecurityRouteRules = Partial<ModuleOptions>

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'nuxt-security:headers': (config: {
      /**
       * The route for which the headers are being configured
       */
      route: string,
      /**
       * The headers configuration for the route
       */
      headers: SecurityHeaders
    }) => void
    'nuxt-security:ready': () => void
  }
} 