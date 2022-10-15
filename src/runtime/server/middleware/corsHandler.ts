import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { defineCorsEventHandler } from '@nozomuikuta/h3-cors'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler(defineCorsEventHandler(securityConfig.corsHandler.value))
