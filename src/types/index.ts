import type { ModuleOptions as CsrfOptions } from 'nuxt-csurf'
import type { Options as RemoveOptions } from 'unplugin-remove/types'
import type { SecurityHeaders } from './headers'
import type { AllowedHTTPMethods, BasicAuth, RateLimiter, RequestSizeLimiter, XssValidator, CorsOptions } from './middlewares'

export type Ssg = {
  enabled?: boolean;
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
  sri: boolean
}

export type NuxtSecurityRouteRules = Pick<ModuleOptions,
  'headers' |
  'requestSizeLimiter' |
  'rateLimiter' |
  'xssValidator' |
  'corsHandler' |
  'allowedMethodsRestricter' |
  'nonce' |
  'sri' |
  'ssg'>

