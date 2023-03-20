import { ModuleOptions as CsrfOptions } from 'nuxt-csurf'

export type RequestSizeLimiter = {
  maxRequestSizeInBytes: number;
  maxUploadFileRequestInBytes: number;
};

export type RateLimiter = {
  tokensPerInterval: number;
  interval: string | number;
  fireImmediately?: boolean;
};

export type XssValidator = {
  whiteList: Record<string, any>;
  stripIgnoreTag: boolean;
  stripIgnoreTagBody: boolean;
  css: Record<string, any> | boolean;
} | {};

export type BasicAuth = {
  name: string;
  pass: string;
  enabled: boolean;
  message: string;
}

// Cannot use the H3CorsOptions from `h3` as it breaks the build process for some reason :(
export type CorsOptions = {
  origin?: "*" | "null" | string | (string | RegExp)[] | ((origin: string) => boolean);
  methods?: "*" | HTTPMethod[];
  allowHeaders?: "*" | string[];
  exposeHeaders?: "*" | string[];
  credentials?: boolean;
  maxAge?: string | false;
  preflight?: {
      statusCode?: number;
  };
}

export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'POST' | string;

export type AllowedHTTPMethods = HTTPMethod[] | '*'

export type MiddlewareConfiguration<MIDDLEWARE> = {
  value: MIDDLEWARE;
  route: string;
  throwError?: boolean;
}

export type CrossOriginResourcePolicyValue = 'same-site' | 'same-origin' | 'cross-origin';

export type CrossOriginOpenerPolicyValue = 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';

export type CrossOriginEmbedderPolicyValue = 'unsafe-none' | 'require-corp';

export type ReferrerPolicyValue =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

export type XContentTypeOptionsValue = 'nosniff';

export type XDnsPrefetchControlValue = 'on' | 'off';

export type XDownloadOptionsValue = 'noopen';

export type XFrameOptionsValue = 'DENY' | 'SAMEORIGIN';

export type XPermittedCrossDomainPoliciesValue =
  | 'none'
  | 'master-only'
  | 'by-content-type'
  | 'by-ftp-filename'
  | 'all';

// according to https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy#values
export type CSPSourceValue =
  | "'self'"
  | "'unsafe-eval'"
  | "'wasm-unsafe-eval'"
  | "'unsafe-hashes'"
  | "'unsafe-inline'"
  | "'none'"
  | "'strict-dynamic'"
  | "'report-sample'"
  // for convenient use of any hosts, protocols, hashes and binaries
  | string;

export type CSPSandboxValue =
| 'allow-downloads'
| 'allow-downloads-without-user-activation'
| 'allow-forms'
| 'allow-modals'
| 'allow-orientation-lock'
| 'allow-pointer-lock'
| 'allow-popups'
| 'allow-popups-to-escape-sandbox'
| 'allow-presentation'
| 'allow-same-origin'
| 'allow-scripts'
| 'allow-storage-access-by-user-activation'
| 'allow-top-navigation'
| 'allow-top-navigation-by-user-activation'
| 'allow-top-navigation-to-custom-protocols';

export type ContentSecurityPolicyValue = {
  'child-src'?: CSPSourceValue[];
  'connect-src'?: CSPSourceValue[];
  'default-src'?: CSPSourceValue[];
  'font-src'?: CSPSourceValue[];
  'frame-src'?: CSPSourceValue[];
  'img-src'?: CSPSourceValue[];
  'manifest-src'?: CSPSourceValue[];
  'media-src'?: CSPSourceValue[];
  'object-src'?: CSPSourceValue[];
  'prefetch-src'?: CSPSourceValue[];
  'script-src'?: CSPSourceValue[];
  'script-src-elem'?: CSPSourceValue[];
  'script-src-attr'?: CSPSourceValue[];
  'style-src'?: CSPSourceValue[];
  'style-src-elem'?: CSPSourceValue[];
  'style-src-attr'?: CSPSourceValue[];
  'worker-src'?: CSPSourceValue[];
  'base-uri'?: CSPSourceValue[];
  'sandbox'?: CSPSandboxValue[];
  'form-action'?: CSPSourceValue[];
  'frame-ancestors'?: ("'self'" | "'none'" | string)[];
  'navigate-to'?: ("'self'" | "'none'" | "'unsafe-allow-redirects'" | string)[];
  'report-uri'?: string[];
  'report-to'?: string[];
  'upgrade-insecure-requests'?: boolean;
};

export type StrictTransportSecurityValue = {
  maxAge: number;
  includeSubdomains?: boolean;
  preload?: boolean;
};

export type PermissionsPolicyValue = {
  'camera'?: string[];
  'display-capture'?: string[];
  'fullscreen'?: string[];
  'geolocation'?: string[];
  'microphone'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'accelerometer'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'ambient-light-sensor'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'autoplay'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'battery'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'document-domain'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'encrypted-media'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'execution-while-not-rendered'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'execution-while-out-of-viewport'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'gamepad'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'gyroscope'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'hid'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'idle-detection'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'local-fonts'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'magnetometer'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'midi'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'payment'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'picture-in-picture'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'publickey-credentials-get'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'screen-wake-lock'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'serial'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'speaker-selection'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'usb'?: string[];
  'web-share'?: string[];
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'xr-spatial-tracking'?: string[];
}

export type SecurityHeaders = {
  crossOriginResourcePolicy?: MiddlewareConfiguration<CrossOriginResourcePolicyValue> | CrossOriginResourcePolicyValue | false;
  crossOriginOpenerPolicy?: MiddlewareConfiguration<CrossOriginOpenerPolicyValue> | CrossOriginOpenerPolicyValue | false;
  crossOriginEmbedderPolicy?: MiddlewareConfiguration<CrossOriginEmbedderPolicyValue> | CrossOriginEmbedderPolicyValue | false;
  contentSecurityPolicy?: MiddlewareConfiguration<ContentSecurityPolicyValue | string> | ContentSecurityPolicyValue | string | false;
  originAgentCluster?: MiddlewareConfiguration<'?1'> | '?1' | false;
  referrerPolicy?: MiddlewareConfiguration<ReferrerPolicyValue> | ReferrerPolicyValue | false;
  strictTransportSecurity?: MiddlewareConfiguration<StrictTransportSecurityValue | string> | StrictTransportSecurityValue | string | false;
  xContentTypeOptions?: MiddlewareConfiguration<XContentTypeOptionsValue> | XContentTypeOptionsValue | false;
  xDNSPrefetchControl?: MiddlewareConfiguration<XDnsPrefetchControlValue> | XDnsPrefetchControlValue | false;
  xDownloadOptions?: MiddlewareConfiguration<XDownloadOptionsValue> | XDownloadOptionsValue | false;
  xFrameOptions?: MiddlewareConfiguration<XFrameOptionsValue> | XFrameOptionsValue | false;
  xPermittedCrossDomainPolicies?: MiddlewareConfiguration<XPermittedCrossDomainPoliciesValue> | XPermittedCrossDomainPoliciesValue | false;
  xXSSProtection?: MiddlewareConfiguration<string> | string | false;
  permissionsPolicy?: MiddlewareConfiguration<PermissionsPolicyValue | string> | PermissionsPolicyValue | string | false;
};

export type SecurityHeader = Record<string, MiddlewareConfiguration<any>>

export interface ModuleOptions {
  headers: SecurityHeaders | false;
  requestSizeLimiter: MiddlewareConfiguration<RequestSizeLimiter> | RequestSizeLimiter | false;
  rateLimiter: MiddlewareConfiguration<RateLimiter> | RateLimiter | false;
  xssValidator: MiddlewareConfiguration<XssValidator> | XssValidator | false;
  corsHandler: MiddlewareConfiguration<CorsOptions> | CorsOptions | false;
  allowedMethodsRestricter: MiddlewareConfiguration<AllowedHTTPMethods> | AllowedHTTPMethods | false;
  hidePoweredBy: boolean;
  basicAuth: MiddlewareConfiguration<BasicAuth> | BasicAuth | boolean;
  enabled: boolean;
  csrf: CsrfOptions | boolean;
}

export interface NuxtSecurityRouteRules {
  requestSizeLimiter?: RequestSizeLimiter;
  rateLimiter?: RateLimiter;
  xssValidator?: XssValidator;
  corsHandler?: CorsOptions;
  allowedMethodsRestricter: AllowedHTTPMethods;
}
