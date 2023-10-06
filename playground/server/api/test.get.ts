import { defineEventHandler } from 'h3'
import { getRouteRules } from '#imports'

export default defineEventHandler((event) => {
  return getRouteRules(event)
})
