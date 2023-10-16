import { defineEventHandler, createError, getQuery, readBody, getRouteRules } from '#imports'
import { FilterXSS } from 'xss'

export default defineEventHandler(async (event) => {
  const routeRules = getRouteRules(event)
  if (routeRules.security.xssValidator === false) {
    return
  }
  const xssValidator = new FilterXSS(routeRules.security.xssValidator)

  if (event.node.req.socket.readyState !== 'readOnly') {
    if (['POST', 'GET'].includes(event.node.req.method!)) {
      const valueToFilter =
        event.node.req.method === 'GET'
          ? getQuery(event)
          : await readBody(event)
      // Fix for problems when one middleware is returning an error and it is catched in the next
      if (valueToFilter && Object.keys(valueToFilter).length) {
        if (
          valueToFilter.statusMessage &&
          valueToFilter.statusMessage !== 'Bad Request'
        ) { return }
        const stringifiedValue = JSON.stringify(valueToFilter)
        const processedValue = xssValidator.process(
          JSON.stringify(valueToFilter)
        )
        if (processedValue !== stringifiedValue) {
          const badRequestError = {
            statusCode: 400,
            statusMessage: 'Bad Request'
          }
          if (routeRules.security.xssValidator?.throwError === false) {
            return badRequestError
          }

          throw createError(badRequestError)
        }
      }
    }
  }
})
