<template>
  <div>test</div>
</template>

<script lang="ts" setup>
useHead({
  script: () => {
    return {
      key: 'loader',
      src: 'loader.js'
    }
  }
}, { mode: 'server' }) // workaround double load on ssr, see https://github.com/unjs/unhead/issues/136
</script>
