import { FilterXSS, IFilterXSSOptions } from 'xss'
import { defineEventHandler, createError, getQuery, readBody, getRouteRules } from '#imports'

export default defineEventHandler(async (event) => {
  const { security } = getRouteRules(event)

  if (security?.xssValidator) {
    const filterOpt: IFilterXSSOptions = { ...security.xssValidator, escapeHtml: undefined }
    if (security.xssValidator.escapeHtml === false) { // No html escaping (by default "<" is replaced by "&lt;" and ">" by "&gt;")
      filterOpt.escapeHtml = (value: string) => value
    }
    const xssValidator = new FilterXSS(filterOpt)

    if (event.node.req.socket.readyState !== 'readOnly') {
      if (security.xssValidator.methods.includes(event.node.req.method!)) {
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
            if (security.xssValidator.throwError === false) {
              return badRequestError
            }

            throw createError(badRequestError)
          }
        }
      }
    }
  }
})
