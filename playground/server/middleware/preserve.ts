export default defineEventHandler((event) => {
  if (event.path.startsWith('/preserve')) {
    setResponseHeader(event, 'Content-Security-Policy', 'example')
    setResponseHeader(event, 'Referrer-Policy', 'harder-example')
  }
})
