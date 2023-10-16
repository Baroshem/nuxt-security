import type { ModuleOptions as CsrfOptions } from 'nuxt-csurf'
import type { Options as RemoveOptions } from 'unplugin-remove/types'

import { SecurityHeaders } from './headers'
import { AllowedHTTPMethods, BasicAuth, NonceOptions, RateLimiter, RequestSizeLimiter, XssValidator } from './middlewares'
import type { H3CorsOptions} from 'h3'

export type Ssg = {
  hashScripts?: boolean;
};

export interface ModuleOptions {
  headers: SecurityHeaders | false;
  requestSizeLimiter: RequestSizeLimiter | false;
  rateLimiter: RateLimiter | false;
  xssValidator: XssValidator | false;
  corsHandler: H3CorsOptions | false;
  allowedMethodsRestricter: AllowedHTTPMethods | false;
  hidePoweredBy: boolean;
  basicAuth: BasicAuth | false;
  enabled: boolean;
  csrf: CsrfOptions | false;
  nonce: NonceOptions | false;
  removeLoggers?: RemoveOptions | false;
  ssg?: Ssg;
}

export interface NuxtSecurityRouteRules {
  requestSizeLimiter?: RequestSizeLimiter | false;
  rateLimiter?: RateLimiter | false;
  xssValidator?: XssValidator | false;
  corsHandler?: H3CorsOptions | false;
  allowedMethodsRestricter?: AllowedHTTPMethods | false;
  nonce?: NonceOptions | false;
}
