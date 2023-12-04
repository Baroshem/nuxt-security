export type CrossOriginResourcePolicyValue = 'same-site' | 'same-origin' | 'cross-origin';

export type CrossOriginOpenerPolicyValue = 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';

export type CrossOriginEmbedderPolicyValue = 'unsafe-none' | 'require-corp' | 'credentialless';

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
  | "'nonce=<base64-value>'"
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
  'child-src'?: CSPSourceValue[] | string | false;
  'connect-src'?: CSPSourceValue[] | string | false;
  'default-src'?: CSPSourceValue[] | string | false;
  'font-src'?: CSPSourceValue[] | string | false;
  'frame-src'?: CSPSourceValue[] | string | false;
  'img-src'?: CSPSourceValue[] | string | false;
  'manifest-src'?: CSPSourceValue[] | string | false;
  'media-src'?: CSPSourceValue[] | string | false;
  'object-src'?: CSPSourceValue[] | string | false;
  'prefetch-src'?: CSPSourceValue[] | string | false;
  'script-src'?: CSPSourceValue[] | string | false;
  'script-src-elem'?: CSPSourceValue[] | string | false;
  'script-src-attr'?: CSPSourceValue[] | string | false;
  'style-src'?: CSPSourceValue[] | string | false;
  'style-src-elem'?: CSPSourceValue[] | string | false;
  'style-src-attr'?: CSPSourceValue[] | string | false;
  'worker-src'?: CSPSourceValue[] | string | false;
  'base-uri'?: CSPSourceValue[] | string | false;
  'sandbox'?: CSPSandboxValue[] | string | false;
  'form-action'?: CSPSourceValue[] | string | false;
  'frame-ancestors'?: ("'self'" | "'none'" | string)[] | string | false;
  'navigate-to'?: ("'self'" | "'none'" | "'unsafe-allow-redirects'" | string)[] | string | false;
  'report-uri'?: string[] | string | false;
  'report-to'?: string | false;
  'upgrade-insecure-requests'?: boolean;
};

export type StrictTransportSecurityValue = {
  maxAge: number;
  includeSubdomains?: boolean;
  preload?: boolean;
};

export type PermissionsPolicyValue = {
  'camera'?: string[] | string | false;
  'display-capture'?: string[] | string | false;
  'fullscreen'?: string[] | string | false;
  'geolocation'?: string[] | string | false;
  'microphone'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'accelerometer'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'ambient-light-sensor'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'autoplay'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'battery'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'document-domain'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'encrypted-media'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'execution-while-not-rendered'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'execution-while-out-of-viewport'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'gamepad'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'gyroscope'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'hid'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'idle-detection'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'local-fonts'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'magnetometer'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'midi'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'payment'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'picture-in-picture'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'publickey-credentials-get'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'screen-wake-lock'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'serial'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'speaker-selection'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'usb'?: string[] | string | false;
  'web-share'?: string[] | string | false;
  /**
   * 🧪 Experimental. Expect browser behavior to change in the future.
   */
  'xr-spatial-tracking'?: string[] | string | false;
}

export type OptionKey = 
  'contentSecurityPolicy' | 
  'crossOriginEmbedderPolicy' | 
  'crossOriginOpenerPolicy' |
  'crossOriginResourcePolicy' |
  'originAgentCluster' | 
  'referrerPolicy' | 
  'strictTransportSecurity' |
  'xContentTypeOptions' |
  'xDNSPrefetchControl' |
  'xDownloadOptions' |
  'xFrameOptions' |
  'xPermittedCrossDomainPolicies' |
  'xXSSProtection' |
  'permissionsPolicy'

export type HeaderName = 
  'Content-Security-Policy' |
  'Cross-Origin-Embedder-Policy' |
  'Cross-Origin-Opener-Policy' |
  'Cross-Origin-Resource-Policy' |
  'Origin-Agent-Cluster' |
  'Referrer-Policy' |
  'Strict-Transport-Security' |
  'X-Content-Type-Options' |
  'X-DNS-Prefetch-Control' |
  'X-Download-Options' |
  'X-Frame-Options' |
  'X-Permitted-Cross-Domain-Policies' |
  'X-XSS-Protection' |
  'Permissions-Policy'

export interface SecurityHeaders {
  crossOriginResourcePolicy?: CrossOriginResourcePolicyValue | false;
  crossOriginOpenerPolicy?: CrossOriginOpenerPolicyValue | false;
  crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicyValue | false;
  contentSecurityPolicy?: ContentSecurityPolicyValue | false;
  originAgentCluster?: '?1' | false;
  referrerPolicy?: ReferrerPolicyValue | false;
  strictTransportSecurity?: StrictTransportSecurityValue | false;
  xContentTypeOptions?: XContentTypeOptionsValue | false;
  xDNSPrefetchControl?: XDnsPrefetchControlValue | false;
  xDownloadOptions?: XDownloadOptionsValue | false;
  xFrameOptions?: XFrameOptionsValue | false;
  xPermittedCrossDomainPolicies?: XPermittedCrossDomainPoliciesValue | false;
  xXSSProtection?: string | false;
  permissionsPolicy?: PermissionsPolicyValue | false;
}
