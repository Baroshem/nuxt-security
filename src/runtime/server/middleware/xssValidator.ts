import { getMethod, defineEventHandler, createError, getQuery, getRequestHeader, getBodyEvent, readBody, readMultipartFormData } from '#nuxt-security/server'
import { FilterXSS, type IFilterXSSOptions } from 'xss'
import { resolveSecurityRules } from '../../nitro/context'
import { hasUnsafeXssPayload } from '../../../utils/xss'
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

    {
      if (
        rules.xssValidator.methods &&
        rules.xssValidator.methods.includes(
          getMethod(event)! as HTTPMethod
        )
      ) {
        const valueToFilter =
          getMethod(event) === 'GET'
            ? getQuery(event)
            : getRequestHeader(event, 'content-type')?.includes(
                'multipart/form-data'
              )
            ? await readMultipartFormData(getBodyEvent(event))
            : await readBody(getBodyEvent(event))
        // Fix for problems when one middleware is returning an error and it is catched in the next
        if (valueToFilter && Object.keys(valueToFilter).length) {
          if (hasUnsafeXssPayload(valueToFilter, xssValidator)) {
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
