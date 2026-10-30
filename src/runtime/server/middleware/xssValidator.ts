import { defineEventHandler, createError, getBodyEvent, getQuery, getRequestHeader, readBody, readMultipartFormData } from '#nuxt-security/server'
import { FilterXSS, type IFilterXSSOptions } from 'xss'
import { resolveSecurityRules } from '../../nitro/context'
import type { HTTPMethod } from '../../../types/middlewares'

export default defineEventHandler(async(event) => {
  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.xssValidator) {
    // xss >= 1.0.16 only falls back to its default escapeHtml when the key is absent
    const { escapeHtml, ...xssValidatorOptions } = rules.xssValidator
    const filterOpt: IFilterXSSOptions = { ...xssValidatorOptions }
    if (escapeHtml === false) {
      // No html escaping (by default "<" is replaced by "&lt;" and ">" by "&gt;")
      filterOpt.escapeHtml = (value: string) => value
    }
    const xssValidator = new FilterXSS(filterOpt)

    // Only Node.js runtimes have a socket
    if (event.node?.req.socket.readyState !== 'readOnly') {
      if (
        rules.xssValidator.methods &&
        rules.xssValidator.methods.includes(
          event.method as HTTPMethod
        )
      ) {
        const valueToFilter =
          event.method === 'GET'
            ? getQuery(event)
            : getRequestHeader(event, 'content-type')?.includes(
                'multipart/form-data'
              )
            // Reads a copy of the body, which the route handler reads too
            ? await readMultipartFormData(getBodyEvent(event))
            : await readBody(getBodyEvent(event))
        // Fix for problems when one middleware is returning an error and it is catched in the next
        if (valueToFilter && Object.keys(valueToFilter).length) {
          // Only skip XSS filtering if statusMessage === 'Bad Request' (for error propagation)
          if (valueToFilter.statusMessage === 'Bad Request') {
            return
          }
          const stringifiedValue = JSON.stringify(valueToFilter)
          const processedValue = xssValidator.process(
            JSON.stringify(valueToFilter)
          )
          if (processedValue !== stringifiedValue) {
            const badRequestError = {
              statusCode: 400,
              statusMessage: 'Bad Request'
            }
            if (rules.xssValidator.throwError === false) {
              return badRequestError
            }

            throw createError(badRequestError)
          }
        }
      }
    }
  }
})
