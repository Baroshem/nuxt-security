import { defineEventHandler, sendError, createError, getQuery, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { FilterXSS } from 'xss'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler(async (event) => {
  if (['POST', 'GET'].includes(event.req.method!!)) {
    const valueToFilter = event.req.method === 'GET' ? getQuery(event) : readBody(event)
    const xssValidator = new FilterXSS(securityConfig.xssValidator.value)
    const stringifiedValue = JSON.stringify(valueToFilter)
    const processedValue = xssValidator.process(JSON.stringify(valueToFilter))
    if (processedValue !== stringifiedValue) {
      const error = createError({ statusCode: 400, statusMessage: 'Bad Request' })
      sendError(event, error)
    }
  }
})
