import { defineEventHandler, readBody } from 'nitro/h3'
export default defineEventHandler(event => readBody(event))
