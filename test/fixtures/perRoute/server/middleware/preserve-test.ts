export default defineEventHandler((event) => {
  if (event.path.startsWith('/preserve-middleware')) {
    appendHeader(event, 'Content-Security-Policy', 'example')
  }
})
