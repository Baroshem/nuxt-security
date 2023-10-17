// @ts-ignore : the basic-auth module does not export types
import getCredentials from 'basic-auth'
import { useRuntimeConfig, createError, defineEventHandler, sendError, setHeader } from '#imports'

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

  if (basicAuthConfig?.exclude?.some(el => event.path?.startsWith(el)) || basicAuthConfig?.include?.some(el => !event.path?.startsWith(el))) { return }

  if (!credentials || !validateCredentials(credentials!, basicAuthConfig)) {
    setHeader(event, 'WWW-Authenticate', `Basic realm=${basicAuthConfig.message || 'Please enter username and password'}`)
    sendError(event, createError({ statusCode: 401, statusMessage: 'Access denied' }))
  }
})

const validateCredentials = (credentials: Credentials, config: BasicAuth): boolean => credentials?.name === config?.name && credentials?.pass === config?.pass
