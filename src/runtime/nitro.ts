import type { NitroAppPlugin, RenderResponse } from 'nitropack'

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.hook('render:response', (response: RenderResponse) => {
    response.headers = { ...response.headers, 'X-Powered-By': 'Best Framework Ever' }
  })
}
