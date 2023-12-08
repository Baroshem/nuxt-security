import { getRouteRules, defineNitroPlugin, setResponseHeader } from '#imports'
import { type OptionKey } from '../../../types/headers'
import { getNameFromKey, headerStringFromObject } from '../../utils/headers'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (_, {event}) => {
    const { security } = getRouteRules(event)
    if (security?.headers) {
      const { headers } = security
      Object.entries(headers).forEach(([key, optionValue]) => {
        const optionKey = key as OptionKey
        const headerName = getNameFromKey(optionKey)
        if (optionValue !== false) {
          const headerValue = headerStringFromObject(optionKey, optionValue)
          setResponseHeader(event, headerName, headerValue)
        }
      })
    }
  })
})