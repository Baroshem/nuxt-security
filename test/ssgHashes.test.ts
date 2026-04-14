import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

function sha256Base64(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('base64')
}

describe('[nuxt-security] SSG support of CSP', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssgHashes', import.meta.url))
  })

  const expectedIntegrityAttributes = 4 // 3 links (entry, page, build meta), 1 script (entry)
  const expectedInlineScriptHashes = 2 // 1 Hydration data, 1 Nuxt global
  const expectedExternalScriptHashes = 2 // 1 entry (modulepreload + script), 1 index (modulepreload)
  const expectedInlineStyleHashes = 0
  const expectedExternalStyleHashes = 0

  function extractDataFromBody(body: string) {
    const elementsWithIntegrity = body.match(/ integrity="sha384-/g)?.length ?? 0
    const metaTag = body.match(/<meta http-equiv="Content-Security-Policy" content="(.*?)">/)
    const csp = metaTag?.[1]
    const policies = csp?.split(';').map(policy => policy.trimStart()) || []
    const scriptSrcPolicy = policies.find(policy => policy.startsWith('script-src '))
    const scriptSrcValues = scriptSrcPolicy?.split(' ') || []
    const inlineScriptHashes = scriptSrcValues.filter(value => value.startsWith("'sha256-")).length
    const externalScriptHashes = scriptSrcValues.filter(value => value.startsWith("'sha384-")).length
    const styleSrcPolicy = policies.find(policy => policy.startsWith('style-src '))
    const styleSrcValues = styleSrcPolicy?.split(' ') || []
    const inlineStyleHashes = styleSrcValues.filter(value => value.startsWith("'sha256-")).length
    const externalStyleHashes = styleSrcValues.filter(value => value.startsWith("'sha384-")).length
    return { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes }
  }

  it('sets CSP via meta in SSG mode', async () => {
    const res = await fetch('/')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes)
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes)
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes)
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
  })

  it('also sets CSP via headers for pre-rendered pages', async () => {
    const res = await fetch('/')

    const headers = res.headers
    const headerCsp = headers.get('content-security-policy')

    const body = await res.text()
    const { csp: metaCsp } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaCsp).toBeDefined()
    expect(headerCsp).toBeDefined()
    // Frame ancestors are not injected in meta tag
    const strippedHeaderCsp = headerCsp!.replace(" frame-ancestors 'self';", '')
    expect(strippedHeaderCsp).toBe(metaCsp)
  })

  it('sets script- and style-src-elem for inline scripts and styles', async () => {
    const res = await fetch('/inline-elem')

    const body = await res.text()
    const { csp } = extractDataFromBody(body)

    expect(csp).toMatch(/script-src-elem[^;]+'sha256-/)
    expect(csp).toMatch(/style-src-elem[^;]+'sha256-/)
  })

  it('sets script-src for inline scripts', async () => {
    const res = await fetch('/inline-script')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes)
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes + 1) // Inlined script in head
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes)
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
  })

  it('sets script-src for inline scripts with line break', async () => {
    const res = await fetch('/inline-script-with-linebreak')
    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes)
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes + 1) // Inlined script in head
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes)
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
  })

  it('sets style-src for inline styles', async () => {
    const res = await fetch('/inline-style')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes)
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes)
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes + 1) // Inlined style
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
  })

  it('sets style-src for inline styles with line break', async () => {
    const res = await fetch('/inline-style-with-linebreak')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes)
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes)
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes + 1) // Inlined style
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
  })


  it('sets script-src for external scripts', async () => {
    const res = await fetch('/external-script')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 1) // + 1 External script
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes)
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes + 1) // External script
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes)
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
  })

  it('sets style-src for external stylesheets', async () => {
    const res = await fetch('/external-style')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)


    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 1) // + 1 External style
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes)
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes)
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes + 1) // External style
  })

  it('does not set policy for unsupported links', async () => {
    const res = await fetch('/external-link')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)


    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 1) // + 1 External link on image
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes)
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes)
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
  })

  it('does not set CSP via meta in SSR mode', async () => {
    const res = await fetch('/not-ssg')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeNull()
    expect(csp).toBeUndefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes + 3) // + 1 External script + 2 links (style + icon)
    expect(inlineScriptHashes).toBe(0)
    expect(externalScriptHashes).toBe(0)
    expect(inlineStyleHashes).toBe(0)
    expect(externalStyleHashes).toBe(0)
  })

  it('does not set CSP via meta when disabled', async () => {
    const res = await fetch('/no-meta-tag')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeNull()
    expect(csp).toBeUndefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes)
    expect(inlineScriptHashes).toBe(0)
    expect(externalScriptHashes).toBe(0)
    expect(inlineStyleHashes).toBe(0)
    expect(externalStyleHashes).toBe(0)
  })

  it('does not deliver frame-ancestors via meta', async () => {
    const notSsgPage = await fetch('/not-ssg')
    expect(notSsgPage).toBeDefined()
    const headers = notSsgPage.headers
    expect(headers).toBeDefined()
    const headerCsp = headers.get('content-security-policy')
    expect(headerCsp).toBeDefined()
    expect(headerCsp).not.toBeNull()
    const headerFrameAncestors = headerCsp!.split(';').map(policy => policy.trim()).find(policy => policy.startsWith('frame-ancestors'))
    expect(headerFrameAncestors).toBe("frame-ancestors 'self'")


    const ssgPage = await fetch('/')
    expect(ssgPage).toBeDefined()
    const body = await ssgPage.text()
    expect(body).toBeDefined()
    const { csp: metaCsp } = extractDataFromBody(body)
    expect(metaCsp).toBeDefined()
    expect(metaCsp).not.toBeNull()
    const metaFrameAncestors = metaCsp!.split(';').find(policy => policy.trim().startsWith('frame-ancestors'))
    expect(metaFrameAncestors).toBeUndefined()
  })

  const INLINE_SCRIPT_HASH_RE = /<script(?![^>]*?\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi
  const INLINE_STYLE_HASH_RE = /<style[^>]*>([\s\S]*?)<\/style>/gi

  function assertAllInlineContentHashed(body: string, cspValue: string, label: string) {
    for (const [, content] of body.matchAll(INLINE_SCRIPT_HASH_RE)) {
      if (!content) continue
      expect(cspValue, `${label}: script hash missing for content: ${content.slice(0, 40)}`).toContain(`'sha256-${sha256Base64(content)}'`)
    }
    for (const [, content] of body.matchAll(INLINE_STYLE_HASH_RE)) {
      if (!content) continue
      expect(cspValue, `${label}: style hash missing for content: ${content.slice(0, 40)}`).toContain(`'sha256-${sha256Base64(content)}'`)
    }
  }

  it('hashes match inline content in the final served HTML', async () => {
    // The `server/plugins/transform-inline.ts` fixture plugin collapses whitespace inside
    // inline <script>/<style> tags during `render:html`. Every inline script/style in the
    // served body must have a matching hash in the CSP meta tag.
    const res = await fetch('/inline-script')
    const body = await res.text()
    const { csp } = extractDataFromBody(body)

    // Confirm the fixture plugin actually ran by checking the served inline script has no
    // newlines (collapsed by the plugin).
    const inlineScriptMatch = body.match(/<script[^>]*>(window\.myImportantVar[^<]*)<\/script>/)
    expect(inlineScriptMatch).not.toBeNull()
    expect(inlineScriptMatch![1]!).not.toMatch(/\n/)

    assertAllInlineContentHashed(body, csp!, '/inline-script meta')
  })

  it.each([
    '/',
    '/inline-script',
    '/inline-script-with-linebreak',
    '/inline-style',
    '/inline-style-with-linebreak',
    '/inline-elem',
    '/external-script',
    '/external-style',
  ])('hashes match served content in both meta and header for %s', async (path) => {
    const res = await fetch(path)
    const body = await res.text()
    const { csp: metaCsp } = extractDataFromBody(body)
    const headerCsp = res.headers.get('content-security-policy')

    expect(metaCsp).toBeDefined()
    expect(headerCsp).toBeDefined()

    // Each inline script/style in served HTML must be hashed into both the meta tag
    // and the response header.
    assertAllInlineContentHashed(body, metaCsp!, `${path} meta`)
    assertAllInlineContentHashed(body, headerCsp!, `${path} header`)
  })

  it('injects exactly one CSP meta tag', async () => {
    const res = await fetch('/inline-script')
    const body = await res.text()
    const matches = body.match(/<meta http-equiv="Content-Security-Policy"/gi) ?? []
    expect(matches.length).toBe(1)
  })

  it('sets CSP meta at top of head after charset meta', async () => {
    const res = await fetch('/')

    const body = await res.text()

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(body).toMatch(/^<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy"/)
  })
})
