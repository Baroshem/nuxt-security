<script setup lang="ts">
useHead({
  link: [{ rel: 'preload', as: 'fetch', href: '/late-assets/asset.txt' }],
})
</script>

<template>
  <div>Late public asset</div>
</template>
