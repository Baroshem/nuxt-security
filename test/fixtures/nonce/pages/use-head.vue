<template>
  <div>test</div>
</template>

<script lang="ts" setup>
const nonce = useNonce()

useHead({
  script: () => ({
    key: 'loader',
    src: 'loader.js',
    nonce
  })
}, { mode: 'server' }) // workaround double load on ssr, see https://github.com/unjs/unhead/issues/136
</script>
