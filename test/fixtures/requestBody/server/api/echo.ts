import { defineEventHandler, readRawBody } from 'h3'
export default defineEventHandler(async event => ({ body: await readRawBody(event) }))
