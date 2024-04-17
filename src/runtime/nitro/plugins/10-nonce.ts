
import { defineNitroPlugin } from "#imports"
import crypto from 'node:crypto'
import { resolveSecurityRules } from "../utils/context"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async(event) => {
    const rules = await resolveSecurityRules(event)
    if (rules.nonce) {
      const nonce = crypto.randomBytes(16).toString('base64')
      event.context.security.nonce = nonce
    }
  })
})




