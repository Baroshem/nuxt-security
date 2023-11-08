<template>
  <div>
    Default page
  </div>
</template>
<script setup>
useHead({
  script: [
    { textContent: 'window.myImportantVar = 1', type: 'text/javascript' }
  ]
})
</script>
