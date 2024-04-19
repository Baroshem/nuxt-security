<template>
  <div>
    <h1>About</h1>
    <p>This page was pre-rendered on {{ time }}</p>
  </div>
</template>
<script setup lang="ts">
const formData = new FormData()
formData.append('test', 'test')
const { data: time } = await useFetch('/api/test', {
  method: 'POST',
  body: formData
})
</script>
