import { defineEventHandler } from 'h3'
export default defineEventHandler(async event => {
  const chunks = []
  for await (const chunk of event.node.req) chunks.push(Buffer.from(chunk))
  return { body: Buffer.concat(chunks).toString('utf8') }
})
