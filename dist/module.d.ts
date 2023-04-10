import * as _nuxt_schema from '@nuxt/schema';
import { ModuleOptions as ModuleOptions$1 } from 'nuxt-csurf';

type RequestSizeLimiter = {
    maxRequestSizeInBytes: number;
    maxUploadFileRequestInBytes: number;
};
type RateLimiter = {
    tokensPerInterval: number;
    interval: string | number;
    fireImmediately?: boolean;
};
type XssValidator = {
    whiteList: Record<string, any>;
    stripIgnoreTag: boolean;
    stripIgnoreTagBody: boolean;
    css: Record<string, any> | boolean;
} | {};
type BasicAuth = {
    name: string;
    pass: string;
    enabled: boolean;
    message: string;
};
type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'POST' | string;
type AllowedHTTPMethods = HTTPMethod[] | '*';
type MiddlewareConfiguration<MIDDLEWARE> = {
    value: MIDDLEWARE;
    route: string;
    throwError?: boolean;
};
type CrossOriginResourcePolicyValue = 'same-site' | 'same-origin' | 'cross-origin';
type CrossOriginOpenerPolicyValue = 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
type CrossOriginEmbedderPolicyValue = 'unsafe-none' | 'require-corp';
type ReferrerPolicyValue = 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
type XContentTypeOptionsValue = 'nosniff';
type XDnsPrefetchControlValue = 'on' | 'off';
type XDownloadOptionsValue = 'noopen';
type XFrameOptionsValue = 'DENY' | 'SAMEORIGIN';
type XPermittedCrossDomainPoliciesValue = 'none' | 'master-only' | 'by-content-type' | 'by-ftp-filename' | 'all';
type CSPSourceValue = "'self'" | "'unsafe-eval'" | "'wasm-unsafe-eval'" | "'unsafe-hashes'" | "'unsafe-inline'" | "'none'" | "'strict-dynamic'" | "'report-sample'" | string;
type CSPSandboxValue = 'allow-downloads' | 'allow-downloads-without-user-activation' | 'allow-forms' | 'allow-modals' | 'allow-orientation-lock' | 'allow-pointer-lock' | 'allow-popups' | 'allow-popups-to-escape-sandbox' | 'allow-presentation' | 'allow-same-origin' | 'allow-scripts' | 'allow-storage-access-by-user-activation' | 'allow-top-navigation' | 'allow-top-navigation-by-user-activation' | 'allow-top-navigation-to-custom-protocols';
type ContentSecurityPolicyValue = {
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
type StrictTransportSecurityValue = {
    maxAge: number;
    includeSubdomains?: boolean;
    preload?: boolean;
};
type PermissionsPolicyValue = {
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
};
type SecurityHeaders = {
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
interface ModuleOptions {
    headers: SecurityHeaders | false;
    requestSizeLimiter: MiddlewareConfiguration<RequestSizeLimiter> | RequestSizeLimiter | false;
    rateLimiter: MiddlewareConfiguration<RateLimiter> | RateLimiter | false;
    xssValidator: MiddlewareConfiguration<XssValidator> | XssValidator | false;
    allowedMethodsRestricter: MiddlewareConfiguration<AllowedHTTPMethods> | AllowedHTTPMethods | false;
    hidePoweredBy: boolean;
    basicAuth: MiddlewareConfiguration<BasicAuth> | BasicAuth | boolean;
    enabled: boolean;
    csrf: ModuleOptions$1 | boolean;
}
interface NuxtSecurityRouteRules {
    requestSizeLimiter?: RequestSizeLimiter | false;
    rateLimiter?: RateLimiter | false;
    xssValidator?: XssValidator | false;
    allowedMethodsRestricter: AllowedHTTPMethods | false;
}

declare module "@nuxt/schema" {
    interface NuxtOptions {
        security: ModuleOptions;
    }
}
declare module "nitropack" {
    interface NitroRouteRules {
        security: NuxtSecurityRouteRules;
    }
    interface NitroRouteConfig {
        security: NuxtSecurityRouteRules;
    }
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

export { _default as default };
