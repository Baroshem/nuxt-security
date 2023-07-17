<template>
  <div>test</div>
</template>

<script lang="ts" setup>
const nonce = useNonce()

useHead({
  script: () => ({
    src: 'loader.js',
    nonce
  })
})
</script>
