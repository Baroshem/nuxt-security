import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, fetch } from '@nuxt/test-utils'

describe('[nuxt-security] Hide Powered-By', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/hidePoweredBy', import.meta.url)),
    
  })

  it ('should hide Powered-By on pages', async () => {
    const res = await fetch('/')

    expect(res.status).toBe(200)
    const { headers } = res
    expect(headers).toBeDefined()
    const xpb = headers.get('x-powered-by')
    expect(xpb).toBeNull()
  })


  it ('should hide Powered-By on public assets', async () => {
    const res = await fetch('/icon.png')

    expect(res.status).toBe(200)
    const { headers } = res
    expect(headers).toBeDefined()
    const xpb = headers.get('x-powered-by')
    expect(xpb).toBeNull()
  })

  it ('should hide Powered-By on bundled assets', async () => {
    const res = await fetch('/')
    const text = await res.text()

    const head = text.match(/<head>(.*?)<\/head>/s)?.[1]
    expect(head).toBeDefined()

    const script = head!.match(/<script.*? src="(.*?)"/)?.[1]
    expect(script).toBeDefined()

    const { headers } = await fetch(script!)
    expect(headers).toBeDefined()
    const xpb = headers.get('x-powered-by')
    expect(xpb).toBeNull()
  })

  it ('should hide Powered-By on server routes', async () => {
    const res = await fetch('/api/hello')

    expect(res.status).toBe(200)
    const { headers } = res
    expect(headers).toBeDefined()
    const xpb = headers.get('x-powered-by')
    expect(xpb).toBeNull()
  })

  /*
  // For this test to work we would need to find a way to catch Nitro errors
  it ('should not throw if redirected', async () => {
    // useTestContext seems the natural place to look for
    const { serverProcess, nuxt } = useTestContext()

    const res = await fetch('/go/google')

    // Do something to find out whether Nitro errors out
    // ...
  })
  */
  
})
