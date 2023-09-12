import { ModuleOptions as CsrfOptions } from 'nuxt-csurf'

import { SecurityHeaders } from './headers'
import { AllowedHTTPMethods, BasicAuth, CorsOptions, NonceOptions, RateLimiter, RequestSizeLimiter, XssValidator } from './middlewares'

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
  nonce: NonceOptions | false;
}

export interface NuxtSecurityRouteRules {
  requestSizeLimiter?: RequestSizeLimiter | false;
  rateLimiter?: RateLimiter | false;
  xssValidator?: XssValidator | false;
  corsHandler?: CorsOptions | false;
  allowedMethodsRestricter: AllowedHTTPMethods | false;
  nonce?: NonceOptions | false;
}
