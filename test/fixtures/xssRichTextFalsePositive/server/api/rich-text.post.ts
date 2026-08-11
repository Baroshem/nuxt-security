import { defineEventHandler, readRawBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, 'utf8')

  return {
    ok: true,
    body,
  }
})
