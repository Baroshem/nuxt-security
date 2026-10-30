import { basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { loadNuxt } from '@nuxt/kit'

// Nitro v3 only registers a handler without a route as a global middleware when it is marked as one
it('[nuxt-security] registers its request middlewares as global middleware', async() => {
  const nuxt = await loadNuxt({ cwd: fileURLToPath(new URL('./fixtures/basicAuth', import.meta.url)), ready: true })
  try {
    const middlewares = nuxt.options.serverHandlers.filter(handler => handler.handler.includes('/runtime/server/middleware/'))
    expect(middlewares.map(handler => basename(handler.handler))).toEqual(['requestSizeLimiter', 'corsHandler', 'allowedMethodsRestricter', 'rateLimiter', 'xssValidator', 'basicAuth'])
    for (const handler of middlewares) {
      expect(handler.middleware).toBe(true)
      expect(handler.route || undefined).toBeUndefined()
    }
  } finally {
    await nuxt.close()
  }
})
