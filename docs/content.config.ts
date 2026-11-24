import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  // Use the supported Zod 4 schema adapter, rather than the legacy v3 schema export.
  // 使用 Content 的 Zod 4 schema adapter，不使用舊版 v3 schema export。
  collections: { docs: defineCollection({ type: 'page', source: '**/*.md', schema: z.object({}) }) }
})
