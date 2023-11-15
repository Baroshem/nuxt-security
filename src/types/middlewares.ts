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
  whiteList?: Record<string, any>;
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

export type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'POST' | string;

export type AllowedHTTPMethods = {
  methods: HTTPMethod[] | '*';
  throwError?: boolean;
}
