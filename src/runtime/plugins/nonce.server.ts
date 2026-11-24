import { defineNuxtPlugin, useRequestEvent, useHead } from '#imports'

/** Seed Unhead before Nuxt extracts the streaming nonce. / 在 Nuxt 讀取串流 nonce 前寫入 Unhead。 */
export default defineNuxtPlugin(() => {
  const nonce = useRequestEvent()?.context.security?.nonce
  if (nonce) useHead({ script: [{ key: 'nuxt-security-nonce', id: 'nuxt-security-nonce', type: 'application/json', innerHTML: '{}', nonce }] })
})
