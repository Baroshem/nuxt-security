<template>
  <div>
    Default page
  </div>
</template>
<script setup>
useHead({
  link: [
    // Make sure integrity will be present with rel preload
    // The test will check that the hash is not copied into CSP
    { rel: 'preload', as: 'image', href: '/icon.png' }
  ]
})
</script>
