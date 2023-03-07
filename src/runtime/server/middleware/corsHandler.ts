import { defineEventHandler, handleCors } from 'h3'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler((event) => {
  handleCors(event, securityConfig.corsHandler.value)
})
