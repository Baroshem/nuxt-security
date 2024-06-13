import { io } from 'socket.io-client'

export default defineNuxtPlugin(async (nuxtApp) => {
  const socket = io()

  nuxtApp.provide('socket', socket)
  nuxtApp.provide('io', io)
})

declare module '#app' {
  interface NuxtApp {
    $io: typeof import('socket.io-client')['io']
    $socket: ReturnType<typeof import('socket.io-client')['io']>
  }
}
