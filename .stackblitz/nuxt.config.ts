// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['nuxt-security'],
  // Following configuration is only necessary to make Stackblitz work correctly.
  // For local projects, you do not need any configuration to try it out.
  security: {
    headers: {
      crossOriginResourcePolicy: {
        value: 'cross-origin',
        route: '/**',
      },
      contentSecurityPolicy: false,
      xFrameOptions: false,
    },
  },
});
