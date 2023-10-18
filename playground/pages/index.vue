<template>
  <div>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData(async () => await Promise.resolve("Home"));
</script>
