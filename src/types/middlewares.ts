export type RequestSizeLimiter = {
  maxRequestSizeInBytes: number;
  maxUploadFileRequestInBytes: number;
  throwError?: boolean;
};

export type RateLimiter = {
  tokensPerInterval?: number;
  interval?: number;
  driver?: {
    /**
     * @default 'lruCache'
     */
    name: string,
    options?: Record<string, any>
  }
  headers?: boolean;
  /**
   * Whether to throw on error
   * @default true
   */
  throwError?: boolean;
};

export type XssValidator = {
  whiteList?: Record<string, any>;
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: boolean;
  css?: Record<string, any> | boolean;
  throwError?: boolean;
}

export type BasicAuth = {
  exclude?: string[];
  include?: string[];
  name: string;
  pass: string;
  enabled?: boolean;
  message: string;
}

export type NonceOptions = {
  enabled: boolean;
  mode?: 'renew' | 'check';
  value?: (() => string);
}

export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'POST' | string;

export type AllowedHTTPMethods = {
  methods: HTTPMethod[] | '*';
  throwError?: boolean;
}
