import type { NitroAppPlugin, RenderResponse } from 'nitropack'

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.hook('render:response', (response: RenderResponse) => {
    // Temporary as in Nuxt 3.0.0 header name is 'X-Powered-By' and in 3.1.X is 'x-powered-by'
    if (response.headers['x-powered-by']) {
      delete response.headers['x-powered-by']
    } else if (response.headers['X-Powered-By']) {
      delete response.headers['X-Powered-By']
    }
  })
}
