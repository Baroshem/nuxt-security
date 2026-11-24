import { defineNitroPlugin, onPageHtml, onPageResponse, onResponse, useStorage } from '#nuxt-security/server'
import { savePrerenderedHeaders } from '../../../utils/prerenderedHeaders'
import { resolveSecurityRules } from '../context'

export default defineNitroPlugin(async(nitroApp) => {
  if (import.meta.prerender) {
    const dynamic: Record<string, string> = {}
    let savingDynamic = Promise.resolve()
    onPageHtml(nitroApp, async (event, body) => {
      const rules = resolveSecurityRules(event)
      if (rules.enabled && rules.ssg && rules.ssg.dynamicNonce && typeof body === 'string') {
        dynamic[event.path.split('?')[0]] = body
        savingDynamic = savingDynamic.then(() => useStorage('build:nuxt-security').setItem('dynamic.json', dynamic))
        await savingDynamic
      }
    })
    const collected: Record<string, Record<string, string>> = {}
    let saving = Promise.resolve()
    onPageResponse(nitroApp, async(event, headers) => {
      const rules = resolveSecurityRules(event)
      const path = event.path.split('?')[0]
      if (path && rules.enabled && rules.ssg && rules.ssg.nitroHeaders) {
        collected[path] = Object.fromEntries([...headers.entries()].filter(([name]) => (!name.startsWith('access-control-')) && (name !== 'x-powered-by' || !rules.hidePoweredBy)))
        saving = saving.then(() => savePrerenderedHeaders(collected, useStorage('build:nuxt-security')))
        await saving
      }
    })
  } else {
    const collected = await useStorage('assets:nuxt-security').getItem<Record<string, Record<string, string>>>('headers.json') || {}
    onResponse(nitroApp, (event, headers) => {
      const rules = resolveSecurityRules(event)
      const path = event.path.split('?')[0]
      if (rules.enabled && rules.ssg && rules.ssg.nitroHeaders && !rules.ssg.dynamicNonce && collected[path]) {
        for (const [name, value] of Object.entries(collected[path])) headers.set(name, value)
      }
    })
  }
})
