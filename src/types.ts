import { CorsOptions } from '@nozomuikuta/h3-cors'

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

export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'POST' | string;

export type AllowedHTTPMethods = HTTPMethod[] | '*'

export type MiddlewareConfiguration<MIDDLEWARE> = {
  value: MIDDLEWARE;
  route: string;
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

export type SecurityHeaders = {
  crossOriginResourcePolicy: MiddlewareConfiguration<CrossOriginResourcePolicyValue> | false;
  crossOriginOpenerPolicy: MiddlewareConfiguration<CrossOriginOpenerPolicyValue> | false;
  crossOriginEmbedderPolicy: MiddlewareConfiguration<CrossOriginEmbedderPolicyValue> | false;
  contentSecurityPolicy: MiddlewareConfiguration<ContentSecurityPolicyValue | string> | false;
  originAgentCluster: MiddlewareConfiguration<'?1'> | false;
  referrerPolicy: MiddlewareConfiguration<ReferrerPolicyValue> | false;
  strictTransportSecurity: MiddlewareConfiguration<StrictTransportSecurityValue | string> | false;
  xContentTypeOptions: MiddlewareConfiguration<XContentTypeOptionsValue> | false;
  xDNSPrefetchControl: MiddlewareConfiguration<XDnsPrefetchControlValue> | false;
  xDownloadOptions: MiddlewareConfiguration<XDownloadOptionsValue> | false;
  xFrameOptions: MiddlewareConfiguration<XFrameOptionsValue> | false;
  xPermittedCrossDomainPolicies: MiddlewareConfiguration<XPermittedCrossDomainPoliciesValue> | false;
  xXSSProtection: MiddlewareConfiguration<string> | false;
};

export type SecurityHeader = Record<string, MiddlewareConfiguration<any>>

export interface ModuleOptions {
  headers: SecurityHeaders | false;
  requestSizeLimiter: MiddlewareConfiguration<RequestSizeLimiter> | false;
  rateLimiter: MiddlewareConfiguration<RateLimiter> | false;
  xssValidator: MiddlewareConfiguration<XssValidator> | false;
  corsHandler: MiddlewareConfiguration<CorsOptions> | false;
  allowedMethodsRestricter: MiddlewareConfiguration<AllowedHTTPMethods> | false;
  hidePoweredBy: boolean;
  basicAuth: MiddlewareConfiguration<BasicAuth> | boolean;
}
