import { defineEventHandler, createError, getQuery, readBody, readMultipartFormData } from 'h3'
import { type IFilterXSSOptions } from 'xss'
import { resolveSecurityRules } from '../../nitro/context'
import { hasMaliciousPayload } from '../utils/xssPayload'

export default defineEventHandler(async(event) => {
  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.xssValidator) {
    const filterOpt: IFilterXSSOptions = {
      ...rules.xssValidator,
      escapeHtml: undefined
    }
    if (event.node.req.socket.readyState !== 'readOnly') {
      const method = event.node.req.method
      if (method && (rules.xssValidator.methods as readonly string[]).includes(method)) {
        const valueToFilter =
            method === 'GET'
            ? getQuery(event)
            : event.node.req.headers['content-type']?.includes(
                'multipart/form-data'
              )
            ? await readMultipartFormData(event)
            : await readBody(event)
        if (valueToFilter && Object.keys(valueToFilter).length) {
          if (hasMaliciousPayload(valueToFilter, filterOpt)) {
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
