export default defineEventHandler((event) => {
  event.node.res.setHeader('Content-Type', 'application/javascript')
  return 'console.log("Hello World")'
})
