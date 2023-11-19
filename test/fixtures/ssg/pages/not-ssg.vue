<template>
  <div>
    Default page
  </div>
</template>
<script setup>
useHead({
  script: [
    { src: '/external.js' },
    { textContent: 'window.myImportantVar = 4', type: 'text/javascript' }
  ],
  link: [
    { rel: 'stylesheet', href: '/external.css' },
    { rel: 'icon', href: '/icon.png' }
  ]
})
</script>