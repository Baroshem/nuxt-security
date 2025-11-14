export default defineEventHandler(async (event) => {
  console.log('CSRF protected endpoint called', event.path)
  
  const body = await readBody(event)
  const time = new Date().toISOString()
  
  return { 
    message: 'Success! CSRF protected endpoint accessed successfully.',
    timestamp: time,
    data: body
  }
})
