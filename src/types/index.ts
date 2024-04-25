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
  enabled: boolean;
  nonce: boolean;
  ssg: Ssg | false;
  sri: boolean
  basicAuth: BasicAuth | false;
  csrf: CsrfOptions | boolean;
  removeLoggers: RemoveOptions | false;
}

export type NuxtSecurityRouteRules = Partial<
  Omit<ModuleOptions, 'csrf' | 'basicAuth' | 'rateLimiter'> 
  & { rateLimiter: Omit<RateLimiter, 'driver'> | false }
>
