import { defineEventHandler, getRequestHeader, sendError, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security

const FILE_UPLOAD_HEADER = 'multipart/form-data'

export default defineEventHandler(async (event) => {
  if (['POST', 'PUT', 'DELETE'].includes(event.req.method!!)) {
    const contentLengthValue = getRequestHeader(event, 'content-length')
    const contentTypeValue = getRequestHeader(event, 'content-type')

    const isFileUpload = contentTypeValue?.includes(FILE_UPLOAD_HEADER)

    const requestLimit = isFileUpload ? securityConfig.requestSizeLimiter.value.maxUploadFileRequestInBytes : securityConfig.requestSizeLimiter.value.maxRequestSizeInBytes

    if (parseInt(contentLengthValue as string) >= requestLimit) {
      const error = createError({ statusCode: 413, statusMessage: 'Payload Too Large' })
      sendError(event, error)
    }
  }
})
