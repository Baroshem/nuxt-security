import type { H3Event } from 'h3'
import { getRequestHeader } from '#imports'
/**
 * Detect if page is being pre-rendered
 * @param event H3Event
 * @returns boolean
 */
export function isPrerendering(event: H3Event): boolean {
  return !!getRequestHeader(event, 'x-nitro-prerender')
}