import { defineEventHandler } from "#imports"

export default defineEventHandler((event) => {
  return {
    headers: {
      contentSecurityPolicy: {
        'script-src': ['self', 'toto'],
      }
    }
  }
})