<template>
  <div>
    {{ data }}
    <NuxtLink to="/about">
      Go to about page
    </NuxtLink>
  </div>
</template>

<script setup>
const { data } = await useAsyncData(() => 'Home')
</script>
