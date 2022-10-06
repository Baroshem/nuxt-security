import { defineNuxtConfig } from 'nuxt/config'
import MyModule from '..'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  helm: {
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: 'same-origin',
    // Other headers
  }
})
