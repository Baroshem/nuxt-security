<template>
  <div>
    Includes an icon from public folder and an image from public folder
    <img src="/preview.png">
  </div>
</template>
<script setup>
useHead({
  link: [
    { rel: 'icon', href: '/icon.png' },
    { rel: 'preload', as: 'image', href: '/preview.png' }
  ]
})
</script>
