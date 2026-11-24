import { expect, it } from 'vitest'
import { securitySummary } from '../src/utils/inspector'
import { extensionHeaders } from '../src/utils/extensions'

it('never serializes credentials or header/config values in the inspector', () => {
  const summary = securitySummary({ basicAuth: { name: 'private-user', pass: 'private-password', enabled: true, message: 'secret' }, csrf: { encryptSecret: 'csrf-secret' }, headers: { contentSecurityPolicy: { 'connect-src': ['https://private.example'] } } }, { '/api/**': {} })
  const data = JSON.stringify(summary)
  for (const secret of ['private-user', 'private-password', 'csrf-secret', 'private.example', 'encryptSecret']) expect(data).not.toContain(secret)
  expect(summary.headers).toEqual(['contentSecurityPolicy'])
})
it('matches extension case, encoded paths and query boundaries', () => {
  const headers = { xContentTypeOptions: 'nosniff' as const }
  const rules = { '.svg': { headers } }
  for (const path of ['/a.SVG', '/dir/%61.svg?v=1']) expect(extensionHeaders(path, rules)).toEqual(headers)
  for (const path of ['/a.svg.js', '/a?file=.svg', '/a.svg/', '/%ZZ.svg']) expect(extensionHeaders(path, rules)).toBeUndefined()
})
