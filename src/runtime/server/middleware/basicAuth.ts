import { defineEventHandler, setHeader, createError, sendError } from 'h3'
import getCredentials from 'basic-auth'
import { useRuntimeConfig } from '#imports'

type Credentials = {
  name: string;
  pass: string;
};

export type BasicAuth = {
  name: string;
  pass: string;
  enabled: boolean;
  message: string;
}

const securityConfig = useRuntimeConfig().security

export default defineEventHandler(async (event) => {
  const credentials = getCredentials(event.node.req)
  const basicAuthConfig: BasicAuth = securityConfig.basicAuth.value

  if (!credentials && !validateCredentials(credentials, basicAuthConfig)) {
    setHeader(event, 'WWW-Authenticate', `Basic realm=${basicAuthConfig.message || 'Please enter username and password'}`)
    sendError(event, createError({ statusCode: 401, statusMessage: 'Access denied' }))
  }
})

const validateCredentials = (credentials: Credentials, config: BasicAuth): boolean => credentials?.name === config?.name && credentials?.pass === config?.pass
