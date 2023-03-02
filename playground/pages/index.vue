<template>
  {{ data }}
</template>

<script setup>
const { data } = await useAsyncData(() => 'Home')
</script>
