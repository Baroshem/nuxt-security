<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
useHead({
  script: [
    { src: '/api/generated-script' }
  ]
  // workaround for double loads in ssr when using nonce
  // see: https://github.com/unjs/unhead/issues/136
}, { mode: 'server' })
</script>
