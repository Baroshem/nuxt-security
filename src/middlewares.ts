type SecurityMiddlewareNames = Record<string, string>

export const SECURITY_MIDDLEWARE_NAMES: SecurityMiddlewareNames = {
  requestSizeLimiter: 'requestSizeLimiter',
  rateLimiter: 'rateLimiter',
  xssValidator: 'xssValidator',
  corsHandler: 'corsHandler',
  allowedMethodsRestricter: 'allowedMethodsRestricter',
  basicAuth: 'basicAuth',
  csrf: 'csrf',
  nonce: 'nonce'
}
