<template>
  <div>
    Includes an icon from public folder and an image from public folder
    <img src="/preview.png">
  </div>
</template>
<script setup>
useHead({
  link: [
    { rel: 'icon', href: '/icon.png' }, // this one has rel icon, will not have integrity
    { rel: 'preload', as: 'image', href: '/preview.png' } // this one has rel preload, will have integrity
  ]
})
</script>
