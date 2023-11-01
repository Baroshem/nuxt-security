import type { ModuleOptions as CsrfOptions } from 'nuxt-csurf'
import type { Options as RemoveOptions } from 'unplugin-remove/types'

import type { SecurityHeaders } from './headers'
import type { AllowedHTTPMethods, BasicAuth, CorsOptions, RateLimiter, RequestSizeLimiter, XssValidator } from './middlewares'

export type Ssg = {
  hashScripts?: boolean;
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
}

export interface NuxtSecurityRouteRules {
  requestSizeLimiter?: RequestSizeLimiter | false;
  rateLimiter?: RateLimiter | false;
  xssValidator?: XssValidator | false;
  corsHandler?: CorsOptions | false;
  allowedMethodsRestricter?: AllowedHTTPMethods | false;
  nonce?: boolean;
}
