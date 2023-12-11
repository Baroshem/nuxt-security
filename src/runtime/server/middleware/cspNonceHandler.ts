import crypto from 'node:crypto'
import { getRouteRules, defineEventHandler } from '#imports'

export default defineEventHandler((event) => {
  const { security } = getRouteRules(event)

  if (security?.nonce) {
    const nonce = crypto.randomBytes(16).toString('base64')
    event.context.nonce = nonce
  }
})
