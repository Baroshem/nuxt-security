import { queryCollectionSearchSections } from '@nuxt/content/server'

export default defineEventHandler(event => queryCollectionSearchSections(event, 'docs'))
