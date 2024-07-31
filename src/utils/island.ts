import type { H3Event } from 'h3'

export function isIslandRequest(event: H3Event) {
  return event.path.startsWith('/__nuxt_island/')
}