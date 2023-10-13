<template>
  <div>
    <p>
      Async random {{ data }}
    </p>
  </div>
</template>
<script setup>
const { data } = await useAsyncData(() => Math.round(Math.random()*1000))
</script>