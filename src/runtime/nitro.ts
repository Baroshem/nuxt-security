import type { NitroAppPlugin, RenderResponse } from 'nitropack'

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.hook('render:response', (response: RenderResponse) => {
    delete response.headers['X-Powered-By']
  })
}
