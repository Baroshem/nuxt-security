import type { ModuleOptions as CsrfOptions } from 'nuxt-csurf'
import type { Options as RemoveOptions } from 'unplugin-remove/types'
import type { SecurityHeaders } from './headers'
import type { AllowedHTTPMethods, BasicAuth, RateLimiter, RequestSizeLimiter, XssValidator, CorsOptions } from './middlewares'
import type { HookResult } from '@nuxt/schema'


export type Ssg = {
  meta?: boolean;
  hashScripts?: boolean;
  hashStyles?: boolean;
  nitroHeaders?: boolean;
  exportToPresets?: boolean;
};

export interface ModuleOptions {
  strict: boolean;
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
  removeLoggers: RemoveOptions | boolean;
  contentSecurityPolicyReportOnly: boolean;
}

export type NuxtSecurityRouteRules = Partial<
  Omit<ModuleOptions, 'strict' | 'basicAuth' | 'rateLimiter' | 'ssg' | 'requestSizeLimiter' | 'removeLoggers' >
  & { rateLimiter: Omit<RateLimiter, 'driver'> | false }
  & { ssg: Omit<Ssg, 'exportToPresets'> | false }
  & { requestSizeLimiter: RequestSizeLimiter | false }
>

declare module 'nuxt/schema' {
  interface NuxtOptions {
    security: ModuleOptions
  }
  interface RuntimeConfig {
    security: ModuleOptions,
    private: { basicAuth: BasicAuth | false, [key: string]: any }
  }
  interface NuxtHooks {
    'nuxt-security:prerenderedHeaders': (prerenderedHeaders: Record<string, Record<string, string>>) => HookResult
  }
}

declare module 'nitropack/types' {
  interface NitroRouteConfig {
    security?: NuxtSecurityRouteRules;
    csurf?: CsrfOptions | boolean;
  }
  interface NitroRuntimeHooks {
    /**
     * @deprecated
     */
    'nuxt-security:headers': (config: {
      /**
       * The route for which the headers are being configured
       */
      route: string,
      /**
       * The headers configuration for the route
       */
      headers: NuxtSecurityRouteRules['headers']
    }) => void
    /**
     * @deprecated
     */
    'nuxt-security:ready': () => void
    /**
     * Runtime hook to configure security rules for each route
     */
    'nuxt-security:routeRules': (routeRules: Record<string, NuxtSecurityRouteRules>) => void
  }
}
declare module 'nitropack' {
  interface NitroRouteConfig {
    security?: NuxtSecurityRouteRules;
    csurf?: CsrfOptions | boolean;
  }
  interface NitroRuntimeHooks {
    /**
     * @deprecated
     */
    'nuxt-security:headers': (config: {
      /**
       * The route for which the headers are being configured
       */
      route: string,
      /**
       * The headers configuration for the route
       */
      headers: NuxtSecurityRouteRules['headers']
    }) => void
    /**
     * @deprecated
     */
    'nuxt-security:ready': () => void
    /**
     * Runtime hook to configure security rules for each route
     */
    'nuxt-security:routeRules': (routeRules: Record<string, NuxtSecurityRouteRules>) => void
  }
}

export type Section = 'body' | 'bodyAppend' | 'bodyPrepend' | 'head'
declare module 'h3' {
  interface H3EventContext {
    security?: {
      route?: string;
      rules?: NuxtSecurityRouteRules;
      nonce?: string;
      hashes?: {
        script: Set<string>;
        style: Set<string>;
      };
    }
  }
}
