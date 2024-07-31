import type { H3Event } from 'h3'

export function isIslandRequst(event: H3Event) {
  return event.path.startsWith('/__nuxt_island/')
}