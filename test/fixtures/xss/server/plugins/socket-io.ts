import { Server as Engine } from 'engine.io'
import { Server } from 'socket.io'

export default defineNitroPlugin((nitroApp) => {
  const engine = new Engine()
  const io = new Server({
    cookie: {
      name: 'io',
      httpOnly: true,
      sameSite: 'lax',
    },
  })

  io.bind(engine)
  io.of('/').on('connection', (socket) => {
    socket.on('id:req', async (cb: (response: { id: string } | { error: string }) => void) => {
      console.log('requested ID')
      cb({ id: 'some-id' })
    })
  })

  nitroApp.router.use('/socket.io/', defineEventHandler({
    handler(event) {
      engine.handleRequest(event.node.req, event.node.res)
      event._handled = true
    },
    websocket: {
      open(peer) {
        const nodeContext = peer.ctx.node
        const req = nodeContext.req

        // @ts-expect-error private method
        engine.prepare(req)

        const rawSocket = nodeContext.req.socket
        const websocket = nodeContext.ws

        // @ts-expect-error private method
        engine.onWebSocket(req, rawSocket, websocket)
      },
    },
  }))
})
