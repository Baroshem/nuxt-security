import { setHeader, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

const helmConfig = useRuntimeConfig().helm

export default defineEventHandler((event) => {
  setHeader(event, 'Cross-Origin-Opener-Policy', helmConfig.crossOriginOpenerPolicy)
})
