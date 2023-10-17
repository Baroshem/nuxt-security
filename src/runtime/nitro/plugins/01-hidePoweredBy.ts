import type { NitroAppPlugin } from 'nitropack'

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.hook('render:response', (response) => {
    if (response?.headers?.['x-powered-by']) {
      delete response.headers['x-powered-by']
    }
  })
}
