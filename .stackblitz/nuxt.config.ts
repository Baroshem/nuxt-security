// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  devtools: {
    enabled: false,
  },
  modules: ['nuxt-security'],
  // Following configuration is only necessary to make Stackblitz work correctly.
  // For local projects, you do not need any configuration to try it out.
  security: {
    headers: {
      contentSecurityPolicy: {
        'frame-ancestors': false
      },
    },
  },
});
