import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(event => readBody(event))
