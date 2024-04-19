export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('error', async (error) => {
    console.error(error);
  });
});