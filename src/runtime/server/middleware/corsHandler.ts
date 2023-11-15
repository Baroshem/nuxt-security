import { getRouteRules, defineEventHandler, handleCors } from '#imports'

export default defineEventHandler((event) => {
  const { security } = getRouteRules(event)

  if (security?.corsHandler) {
    const { corsHandler } = security
    handleCors(event, corsHandler)
  }

})
