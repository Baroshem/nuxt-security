export type RequestSizeLimiter = {
  maxRequestSizeInBytes: number;
  maxUploadFileRequestInBytes: number;
  throwError?: boolean;
};

export type RateLimiter = {
  /** 
   * Max number of tokens per time interval
   * @default 150 
   */
  tokensPerInterval?: number;
  /**
   * Time interval basis, in ms
   * @default 300_000
   */
  interval?: number;
  /**
   * The unstorage driver
   */
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

// Cannot use the H3CorsOptions from `h3` as it breaks the build process for some reason :(
  // Now with proper TS imports we can
  /*
export type CorsOptions = {
  origin?: '*' | 'null' | string | (string | RegExp)[] | ((origin: string) => boolean);
  methods?: '*' | HTTPMethod[];
  allowHeaders?: '*' | string[];
  exposeHeaders?: '*' | string[];
  credentials?: boolean;
  maxAge?: string | false;
  preflight?: {
      statusCode?: number;
  };
}
*/

export type AllowedHTTPMethods = {
  methods: HTTPMethod[] | '*';
  throwError?: boolean;
}
