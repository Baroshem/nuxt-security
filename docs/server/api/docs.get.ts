import { queryCollection, queryCollectionItemSurroundings } from '@nuxt/content/server'

// Keep SQLite on the server so navigation does not require unsafe-eval/WASM CSP sources.
// SQLite 留在伺服器，文件導覽不需放寬 CSP 允許 WASM。
export default defineEventHandler(async event => {
  const { path } = getQuery(event)
  if (typeof path !== 'string' || !path.startsWith('/') || path.length > 2048) throw createError({ statusCode: 400 })
  const [page, surround] = await Promise.all([
    queryCollection(event, 'docs').path(path).first(),
    queryCollectionItemSurroundings(event, 'docs', path)
  ])
  if (!page) throw createError({ statusCode: 404 })
  return { page, surround: surround.map(doc => doc?.navigation === false ? null : doc) }
})
