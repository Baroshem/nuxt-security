import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] SSG support of CSP', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssgHashes', import.meta.url))
  })

  const expectedIntegrityAttributes = 4 // 3 links (entry, page, vue), 1 script (entry)
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

  it('sets CSP in SSG mode', async () => {
    const res = await fetch('/')

    const body = await res.text()
    const { metaTag, csp, elementsWithIntegrity, inlineScriptHashes, externalScriptHashes, inlineStyleHashes, externalStyleHashes } = extractDataFromBody(body)

    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(body).toBeDefined()
    expect(metaTag).toBeDefined()
    expect(csp).toBeDefined()
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes - 1) // No vue on home page
    expect(inlineScriptHashes).toBe(expectedInlineScriptHashes)
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes)
    expect(inlineStyleHashes).toBe(expectedInlineStyleHashes)
    expect(externalStyleHashes).toBe(expectedExternalStyleHashes)
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
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes + 1) // + 1 vue modulepreload
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
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes + 1) // + 1 vue modulepreload
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
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes + 2) // External script + 1 vue modulepreload
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
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes + 1) // + 1 vue modulepreload
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
    expect(externalScriptHashes).toBe(expectedExternalScriptHashes + 1) // + 1 vue modulepreload
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
    expect(elementsWithIntegrity).toBe(expectedIntegrityAttributes - 1) // No vue on no-meta-tag page
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
})