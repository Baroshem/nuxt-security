import { defineEventHandler, createError, getQuery, readBody, readMultipartFormData } from '#imports'
import { FilterXSS, type IFilterXSSOptions } from 'xss'
import { resolveSecurityRules } from '../../nitro/context'
import type { HTTPMethod } from '../../../types/middlewares'

export default defineEventHandler(async(event) => {
  const rules = resolveSecurityRules(event)

  if (rules.enabled && rules.xssValidator) {
    const filterOpt: IFilterXSSOptions = {
      ...rules.xssValidator,
      escapeHtml: undefined
    }
    if (rules.xssValidator.escapeHtml === false) {
      // No html escaping (by default "<" is replaced by "&lt;" and ">" by "&gt;")
      filterOpt.escapeHtml = (value: string) => value
    }
    const xssValidator = new FilterXSS(filterOpt)

    if (event.node.req.socket.readyState !== 'readOnly') {
      if (
        rules.xssValidator.methods &&
        rules.xssValidator.methods.includes(
          event.node.req.method! as HTTPMethod
        )
      ) {
        const valueToFilter =
          event.node.req.method === 'GET'
            ? getQuery(event)
            : event.node.req.headers['upgrade'] === "websocket"
            ? event.node.req.socket.read().toString('utf8')
            : event.node.req.headers['content-type']?.includes(
                'multipart/form-data'
              )
            ? await readMultipartFormData(event)
            : await readBody(event)
        // Fix for problems when one middleware is returning an error and it is catched in the next
        if (valueToFilter && (typeof valueToFilter === "object" && Object.keys(valueToFilter).length || valueToFilter.length)) {
          if (
            typeof valueToFilter === "object" &&
            valueToFilter.statusMessage &&
            valueToFilter.statusMessage !== 'Bad Request'
          ) {
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
