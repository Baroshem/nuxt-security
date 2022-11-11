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

export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'POST' | string;

export type AllowedHTTPMethods = HTTPMethod[] | '*'

export type MiddlewareConfiguration<MIDDLEWARE> = {
  value: MIDDLEWARE;
  route: string;
}

export type SecurityHeaders = {
  crossOriginResourcePolicy: MiddlewareConfiguration<string> | boolean;
  crossOriginOpenerPolicy: MiddlewareConfiguration<string> | boolean;
  crossOriginEmbedderPolicy: MiddlewareConfiguration<string> | boolean;
  contentSecurityPolicy: MiddlewareConfiguration<string> | boolean;
  originAgentCluster: MiddlewareConfiguration<string> | boolean;
  referrerPolicy: MiddlewareConfiguration<string> | boolean;
  strictTransportSecurity: MiddlewareConfiguration<string> | boolean;
  xContentTypeOptions: MiddlewareConfiguration<string> | boolean;
  xDNSPrefetchControl: MiddlewareConfiguration<string> | boolean;
  xDownloadOptions: MiddlewareConfiguration<string> | boolean;
  xFrameOptions: MiddlewareConfiguration<string> | boolean;
  xPermittedCrossDomainPolicies: MiddlewareConfiguration<string> | boolean;
  xXSSProtection: MiddlewareConfiguration<number> | boolean;
};

export type SecurityHeader = Record<string, MiddlewareConfiguration<any>>

export interface ModuleOptions {
  headers: SecurityHeaders | boolean;
  requestSizeLimiter: MiddlewareConfiguration<RequestSizeLimiter> | boolean;
  rateLimiter: MiddlewareConfiguration<RateLimiter> | boolean;
  xssValidator: MiddlewareConfiguration<XssValidator> | boolean;
  corsHandler: MiddlewareConfiguration<CorsOptions> | boolean;
  allowedMethodsRestricter: MiddlewareConfiguration<AllowedHTTPMethods> | boolean;
  hidePoweredBy: boolean;
}
