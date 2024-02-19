export type RequestSizeLimiter = {
  maxRequestSizeInBytes: number;
  maxUploadFileRequestInBytes: number;
  throwError?: boolean;
};

export type RateLimiter = {
  tokensPerInterval: number;
  interval: string | number;
  driver?: {
    name: string,
    options?: Record<string, any>
  }
  headers?: boolean;
  throwError?: boolean;
};

export type XssValidator = {
  /** Array of methods for which the validator will be invoked. 
  @default ['GET', 'POST']
  */
  methods?: Array<HTTPMethod>;
  whiteList?: Record<string, any>;
  escapeHtml?: boolean;
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: boolean;
  css?: Record<string, any> | boolean;
  throwError?: boolean;
};

export type BasicAuth = {
  exclude?: string[];
  include?: string[];
  name: string;
  pass: string;
  enabled?: boolean;
  message: string;
}

export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' | 'TRACE' | 'OPTIONS' | 'CONNECT' | 'HEAD';

// Cannot use the H3CorsOptions from `h3` as it breaks the build process for some reason :(
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

export type AllowedHTTPMethods = {
  methods: HTTPMethod[] | '*';
  throwError?: boolean;
}
