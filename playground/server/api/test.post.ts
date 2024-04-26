export default defineEventHandler(async (event) => {
  console.log('api test', event.path)
  const time = new Date().toISOString()
  return time
})
