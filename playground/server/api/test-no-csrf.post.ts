export default defineEventHandler(async (event) => {
  console.log('CSRF excluded endpoint called', event.path)
  
  const body = await readBody(event)
  const time = new Date().toISOString()
  
  return { 
    message: 'Success! CSRF excluded endpoint accessed without token.',
    timestamp: time,
    data: body
  }
})
