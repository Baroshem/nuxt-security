import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'

export async function startBuiltApp(entry: string, extraEnv: Record<string, string> = {}, executable = globalThis.process.execPath) {
  const reservation = createServer().listen(0, '127.0.0.1')
  await once(reservation, 'listening')
  const port = (reservation.address() as { port: number }).port
  await new Promise<void>(resolve => reservation.close(() => resolve()))
  const process = spawn(executable, [entry], {
    env: { ...globalThis.process.env, HOST: '127.0.0.1', PORT: String(port), NITRO_PORT: String(port), ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
  })
  let logs = ''
  process.stdout.on('data', data => { logs += data })
  process.stderr.on('data', data => { logs += data })
  const url = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 200; attempt++) {
    if (process.exitCode !== null) throw new Error(logs)
    try { await fetch(url, { signal: AbortSignal.timeout(1000) }); return { url, close: () => process.kill(), logs: () => logs } } catch { /* Wait for the server socket. / 等待 server socket。 */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  process.kill()
  throw new Error(`App did not start / 應用程式未啟動: ${logs}`)
}
