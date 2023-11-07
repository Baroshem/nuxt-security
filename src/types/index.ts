import type { ModuleOptions as CsrfOptions } from 'nuxt-csurf'
import type { Options as RemoveOptions } from 'unplugin-remove/types'

import type { SecurityHeaders } from './headers'
import type { AllowedHTTPMethods, BasicAuth, CorsOptions, RateLimiter, RequestSizeLimiter, XssValidator } from './middlewares'

export type Ssg = {
  hashScripts?: boolean;
};

export interface ModuleOptions {
  headers: SecurityHeaders | boolean;
  requestSizeLimiter: RequestSizeLimiter | boolean;
  rateLimiter: RateLimiter | boolean;
  xssValidator: XssValidator | boolean;
  corsHandler: CorsOptions | boolean;
  allowedMethodsRestricter: AllowedHTTPMethods | boolean;
  hidePoweredBy: boolean;
  basicAuth: BasicAuth | boolean;
  enabled: boolean;
  csrf: CsrfOptions | boolean;
  nonce: boolean;
  removeLoggers?: RemoveOptions | boolean;
  ssg?: Ssg;
}

export interface NuxtSecurityRouteRules {
  requestSizeLimiter?: RequestSizeLimiter | boolean;
  rateLimiter?: RateLimiter | boolean;
  xssValidator?: XssValidator | boolean;
  corsHandler?: CorsOptions | boolean;
  allowedMethodsRestricter?: AllowedHTTPMethods | boolean;
  nonce?: boolean;
}
