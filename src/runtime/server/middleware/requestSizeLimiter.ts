import { defineEventHandler, getRequestHeader, createError } from '#imports'
import { resolveSecurityRules } from '../../nitro/utils/context'

const FILE_UPLOAD_HEADER = 'multipart/form-data'

export default defineEventHandler(async(event) => {
  const rules = await resolveSecurityRules(event)

  if (rules?.requestSizeLimiter) {
    if (['POST', 'PUT', 'DELETE'].includes(event.node.req.method!)) {
      const contentLengthValue = getRequestHeader(event, 'content-length')
      const contentTypeValue = getRequestHeader(event, 'content-type')

      const isFileUpload = contentTypeValue?.includes(FILE_UPLOAD_HEADER)

      const requestLimit = isFileUpload
        ? rules.requestSizeLimiter.maxUploadFileRequestInBytes
        : rules.requestSizeLimiter.maxRequestSizeInBytes

      if (parseInt(contentLengthValue as string) >= requestLimit) {
        const payloadTooLargeError = {
          statusCode: 413,
          statusMessage: 'Payload Too Large'
        }
        if (rules.requestSizeLimiter.throwError === false) {
          return payloadTooLargeError
        }
        throw createError(payloadTooLargeError)
      }
    }
  }
})
