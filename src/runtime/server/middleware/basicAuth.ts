import { createError, defineEventHandler, getRequestHeader, setHeader, useRuntimeConfig } from '#nuxt-security/server'
// @ts-ignore : the basic-auth module does not export types
import getCredentials from 'basic-auth'

type Credentials = {
  name: string;
  pass: string;
};

export type BasicAuth = {
  exclude?: string[];
  include?: string[];
  name: string;
  pass: string;
  enabled?: boolean;
  message: string;
}

export default defineEventHandler((event) => {
  const credentials = getCredentials.parse(getRequestHeader(event, 'authorization'))
  const securityConfig = useRuntimeConfig(event).private
  const basicAuthConfig = securityConfig.basicAuth

  if (!basicAuthConfig) {
    return
  }


  // Secure default: no excluded paths by default
  // All routes require auth unless user sets exclude/include explicitly
  const excludePaths = basicAuthConfig?.exclude || []
  const isPathExcluded = excludePaths.some(el => event.path?.startsWith(el))

  // Check for inclusion paths
  const includePaths = basicAuthConfig?.include || []
  const isPathIncluded = includePaths.some(el => event.path?.startsWith(el))

  if (isPathExcluded && !isPathIncluded) {
    return
  }

  if (!credentials || !validateCredentials(credentials, basicAuthConfig)) {
    // Set the authentication header and stop the request with an error response
    setHeader(event, 'WWW-Authenticate', `Basic realm=${basicAuthConfig.message || 'Please enter username and password'}`)
    throw createError({ statusCode: 401, statusMessage: 'Access denied' })
  }
})

const validateCredentials = (credentials: Credentials, config: BasicAuth): boolean => credentials?.name === config?.name && credentials?.pass === config?.pass
