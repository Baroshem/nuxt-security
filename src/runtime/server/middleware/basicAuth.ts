//@ts-ignore
import getCredentials from 'basic-auth'
import { createError, defineEventHandler, sendError, setHeader } from 'h3'
import type { BasicAuth } from '~/src/types/middlewares';
import { useRuntimeConfig } from '#imports'

type Credentials = {
  name: string;
  pass: string;
};
/*
export type BasicAuth = {
  exclude?: string[];
  include?: string[];
  name: string;
  pass: string;
  enabled?: boolean;
  message: string;
}
*/
const securityConfig = useRuntimeConfig().security

export default defineEventHandler((event) => {
  const credentials = getCredentials(event.node.req)
  const basicAuthConfig = securityConfig.basicAuth
  
  if (!basicAuthConfig) {
    return
  }

  if (basicAuthConfig.exclude?.some(el => event.path?.startsWith(el)) || basicAuthConfig.include?.some(el => !event.path?.startsWith(el))) { return }

  if (!credentials || !validateCredentials(credentials!, basicAuthConfig)) {
    setHeader(event, 'WWW-Authenticate', `Basic realm=${basicAuthConfig.message || 'Please enter username and password'}`)
    sendError(event, createError({ statusCode: 401, statusMessage: 'Access denied' }))
  }
})

const validateCredentials = (credentials: Credentials, config: BasicAuth): boolean => credentials?.name === config?.name && credentials?.pass === config?.pass
