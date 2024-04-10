export default defineEventHandler(async (event) => {
  console.log('api test', event.path, event.context.security)
})
