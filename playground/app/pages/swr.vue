<template>
  <div>
    <h1>SWR page</h1>
    <p>This page was generated on {{ time }}</p>
    <p>
      The current time is {{ newTime }}
    </p>
  </div>
</template>
<script setup lang="ts">
const formData = new FormData()
formData.append('test', 'test')
const { data: time } = useFetch('/api/test', {
  method: 'POST',
  body: formData
})
const newTime = await $fetch('/api/test', {
  method: 'POST',
  body: formData
})
</script>
