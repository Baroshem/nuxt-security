import type { ModuleOptions as CsrfOptions } from 'nuxt-csurf'
import type { Options as RemoveOptions } from 'unplugin-remove/types'
import type { SecurityHeaders } from './headers'
import type { AllowedHTTPMethods, BasicAuth, CorsOptions, RateLimiter, RequestSizeLimiter, XssValidator } from './middlewares'

export type Ssg = {
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
  csrf: CsrfOptions | false;
  nonce: boolean;
  removeLoggers?: RemoveOptions | false;
  ssg?: Ssg;
  /**
   * enable runtime nitro hooks to configure some options at runtime
   */
  runtimeHooks: boolean;
  sri?: boolean
}

export interface NuxtSecurityRouteRules {
  requestSizeLimiter?: RequestSizeLimiter | false;
  rateLimiter?: RateLimiter | false;
  xssValidator?: XssValidator | false;
  corsHandler?: CorsOptions | false;
  allowedMethodsRestricter?: AllowedHTTPMethods | false;
  nonce?: boolean;
}

export interface NuxtSecurityEventContext {
  headers: Record<string, string | string[] | number | false> | null
}

declare module 'h3' {
  interface H3EventContext {
      security: NuxtSecurityEventContext
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'nuxt-security:headers': (route: string, headers: SecurityHeaders) => void
    'nuxt-security:ready': () => void
  }
} 