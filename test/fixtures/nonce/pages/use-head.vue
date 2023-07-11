<template>
  <div>test</div>
</template>

<script lang="ts" setup>
const nonce = useCookie('nonce')
useHead({
  script: () => ({
    src: '/loader.js',
    nonce: nonce.value
  })
})
</script>
