import { defineEventHandler, getRequestHeader, createError, getRouteRules } from '#imports'

const FILE_UPLOAD_HEADER = 'multipart/form-data'

export default defineEventHandler((event) => {
  const { security } = getRouteRules(event)

  if (security?.requestSizeLimiter) {
    if (['POST', 'PUT', 'DELETE'].includes(event.node.req.method!)) {
      const contentLengthValue = getRequestHeader(event, 'content-length')
      const contentTypeValue = getRequestHeader(event, 'content-type')

      const isFileUpload = contentTypeValue?.includes(FILE_UPLOAD_HEADER)

      const requestLimit = isFileUpload
        ? security.requestSizeLimiter.maxUploadFileRequestInBytes
        : security.requestSizeLimiter.maxRequestSizeInBytes

      if (parseInt(contentLengthValue as string) >= requestLimit) {
        const payloadTooLargeError = {
          statusCode: 413,
          statusMessage: 'Payload Too Large'
        }
        if (security.requestSizeLimiter.throwError === false) {
          return payloadTooLargeError
        }
        throw createError(payloadTooLargeError)
      }
    }
  }
})
