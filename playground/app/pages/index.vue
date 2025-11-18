<template>
  <div>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
console.log('hello from index should be removed in production')
const { data } = await useAsyncData(async () => await Promise.resolve("Home"));
</script>
