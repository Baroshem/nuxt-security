import { defineEventHandler, getRequestHeader, createError } from '#imports'
import { defaultSecurityConfig } from '../../../defaultConfig'
import { resolveSecurityRules } from '../../nitro/context'
import { type RequestSizeLimiter } from '../../../types/middlewares'
import defu from 'defu'

const FILE_UPLOAD_HEADER = 'multipart/form-data'
const defaultSizeLimiter = defaultSecurityConfig('').requestSizeLimiter as Required<RequestSizeLimiter>

export default defineEventHandler((event) => {
  const rules  = resolveSecurityRules(event)

  if (rules.enabled && rules.requestSizeLimiter) {
    const requestSizeLimiter = defu(
      rules.requestSizeLimiter, 
      defaultSizeLimiter,
    )
    if (['POST', 'PUT', 'DELETE'].includes(event.node.req.method!)) {
      const contentLengthValue = getRequestHeader(event, 'content-length')
      const contentTypeValue = getRequestHeader(event, 'content-type')

      const isFileUpload = contentTypeValue?.includes(FILE_UPLOAD_HEADER)

      const requestLimit = isFileUpload
        ? requestSizeLimiter.maxUploadFileRequestInBytes
        : requestSizeLimiter.maxRequestSizeInBytes

      if (parseInt(contentLengthValue as string) >= requestLimit) {
        const payloadTooLargeError = {
          statusCode: 413,
          statusMessage: 'Payload Too Large'
        }
        if (requestSizeLimiter.throwError === false) {
          return payloadTooLargeError
        }
        throw createError(payloadTooLargeError)
      }
    }
  }
})
