// TODO: remove when migrating to native H3 cors functionality
import { defineEventHandler } from 'h3'
import { defineCorsEventHandler } from '@nozomuikuta/h3-cors'
import { useRuntimeConfig } from '#imports'

const securityConfig = useRuntimeConfig().security

export default defineEventHandler(defineCorsEventHandler(securityConfig.corsHandler.value))
