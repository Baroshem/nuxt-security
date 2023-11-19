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
  'child-src'?: CSPSourceValue[] | false;
  'connect-src'?: CSPSourceValue[] | false;
  'default-src'?: CSPSourceValue[] | false;
  'font-src'?: CSPSourceValue[] | false;
  'frame-src'?: CSPSourceValue[] | false;
  'img-src'?: CSPSourceValue[] | false;
  'manifest-src'?: CSPSourceValue[] | false;
  'media-src'?: CSPSourceValue[] | false;
  'object-src'?: CSPSourceValue[] | false;
  'prefetch-src'?: CSPSourceValue[] | false;
  'script-src'?: CSPSourceValue[] | false;
  'script-src-elem'?: CSPSourceValue[] | false;
  'script-src-attr'?: CSPSourceValue[] | false;
  'style-src'?: CSPSourceValue[] | false;
  'style-src-elem'?: CSPSourceValue[] | false;
  'style-src-attr'?: CSPSourceValue[] | false;
  'worker-src'?: CSPSourceValue[] | false;
  'base-uri'?: CSPSourceValue[] | false;
  'sandbox'?: CSPSandboxValue[] | false;
  'form-action'?: CSPSourceValue[] | false;
  'frame-ancestors'?: ("'self'" | "'none'" | string)[] | false;
  'navigate-to'?: ("'self'" | "'none'" | "'unsafe-allow-redirects'" | string)[] | false;
  'report-uri'?: string[] | false;
  'report-to'?: string[] | false;
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
  crossOriginResourcePolicy?: CrossOriginResourcePolicyValue | false;
  crossOriginOpenerPolicy?: CrossOriginOpenerPolicyValue | false;
  crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicyValue | false;
  contentSecurityPolicy?: ContentSecurityPolicyValue | string | false;
  originAgentCluster?: '?1' | false;
  referrerPolicy?: ReferrerPolicyValue | false;
  strictTransportSecurity?: StrictTransportSecurityValue | string | false;
  xContentTypeOptions?: XContentTypeOptionsValue | false;
  xDNSPrefetchControl?: XDnsPrefetchControlValue | false;
  xDownloadOptions?: XDownloadOptionsValue | false;
  xFrameOptions?: XFrameOptionsValue | false;
  xPermittedCrossDomainPolicies?: XPermittedCrossDomainPoliciesValue | false;
  xXSSProtection?: string | false;
  permissionsPolicy?: PermissionsPolicyValue | string | false;
};
