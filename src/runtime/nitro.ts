import type { NitroAppPlugin, RenderResponse } from 'nitropack'

export default <NitroAppPlugin> defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response: RenderResponse) => {
    response.headers = { ...response.headers, 'X-Powered-By': 'Best Framework Ever' }
  })
})
