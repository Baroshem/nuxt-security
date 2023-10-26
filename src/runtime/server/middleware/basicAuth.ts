import getCredentials from 'basic-auth'
import { createError, defineEventHandler, sendError, setHeader } from 'h3'
// @ts-ignore
import { useRuntimeConfig } from '#imports'

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

const securityConfig = useRuntimeConfig().private

export default defineEventHandler((event) => {
  const credentials = getCredentials(event.node.req)
  const basicAuthConfig: BasicAuth = securityConfig.basicAuth

  const isInExclude = basicAuthConfig?.exclude?.some(el => event.path?.startsWith(el)) ?? false
  const isInInclude = basicAuthConfig?.include?.some(el => event.path?.startsWith(el)) ?? false

  if (!isInExclude && !isInInclude) {
    return
  }

  if (!credentials || !validateCredentials(credentials!, basicAuthConfig)) {
    setHeader(event, 'WWW-Authenticate', `Basic realm=${basicAuthConfig.message || 'Please enter username and password'}`)
    sendError(event, createError({ statusCode: 401, statusMessage: 'Access denied' }))
  }
})

const validateCredentials = (credentials: Credentials, config: BasicAuth): boolean => credentials?.name === config?.name && credentials?.pass === config?.pass
