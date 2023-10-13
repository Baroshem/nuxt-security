<template>
  <div>
    {{ data }}
  </div>
  <NuxtLink to="/about">Go to about page</NuxtLink>
</template>

<script setup>
const { data } = await useAsyncData(() => 'Home')
</script>
