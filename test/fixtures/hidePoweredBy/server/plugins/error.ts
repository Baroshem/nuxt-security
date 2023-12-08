export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('error', async (error, {event}) => {
    console.error(error);
  });
});