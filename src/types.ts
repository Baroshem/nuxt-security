export type RequestSizeLimiter = {
  maxRequestSizeInBytes: number;
  maxUploadFileRequestInBytes: number;
};

export type RateLimiter = {
  tokensPerInterval: number;
  interval: string | number;
  fireImmediately?: boolean;
};

export type SecurityHeaders = {
  crossOriginResourcePolicy: string | boolean;
  crossOriginOpenerPolicy: string | boolean;
  crossOriginEmbedderPolicy: string | boolean;
  contentSecurityPolicy: string | boolean;
  originAgentCluster: string | boolean;
  referrerPolicy: string | boolean;
  strictTransportSecurity: string | boolean;
  xContentTypeOptions: string | boolean;
  xDNSPrefetchControl: string | boolean;
  xDownloadOptions: string | boolean;
  xFrameOptions: string | boolean;
  xPermittedCrossDomainPolicies: string | boolean;
  xXSSProtection: number | boolean;
};

export interface ModuleOptions {
  headers: SecurityHeaders;
  requestSizeLimiter: RequestSizeLimiter | boolean;
  rateLimiter: RateLimiter | boolean;
}
