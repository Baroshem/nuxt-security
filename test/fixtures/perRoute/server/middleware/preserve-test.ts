export default defineEventHandler((event) => {
  if (event.path.startsWith('/preserve-middleware')) {
    appendHeader(event, 'Content-Security-Policy', 'example')
    setHeader(event, 'Referrer-Policy', 'harder-example')
  }
})
