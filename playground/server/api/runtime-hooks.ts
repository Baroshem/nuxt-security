import { defineEventHandler } from "#imports"

export default defineEventHandler((event) => {
    return {
        csp: getResponseHeader(event, 'Content-Security-Policy')
    }
})