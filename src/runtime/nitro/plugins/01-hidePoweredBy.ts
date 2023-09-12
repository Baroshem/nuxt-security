import type { NitroAppPlugin, RenderResponse } from 'nitropack'

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.hook('render:response', (response: RenderResponse) => {
    if (response.headers['x-powered-by']) {
      delete response.headers['x-powered-by']
    }
  })
}
