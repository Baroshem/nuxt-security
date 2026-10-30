export const errors: string[] = []

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('error', (error) => {
    errors.push(error.message)
  })
})
