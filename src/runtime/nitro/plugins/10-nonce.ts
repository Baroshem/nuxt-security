
import { defineNitroPlugin } from "#imports"
import crypto from 'node:crypto'
import { resolveSecurityRules } from "../utils"

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const rules = resolveSecurityRules(event)
    if (rules.enabled && rules.nonce) {
      const nonce = crypto.randomBytes(16).toString('base64')
      event.context.security.nonce = nonce
    }
  })
})




