<template>
  <div>
    <h1>About</h1>
    <p>Time is {{ data }}
    </p>
  </div>
</template>
<script setup lang="ts">
const formData = new FormData()
formData.append('test', 'test')
const data = await $fetch('/api/test', {
  method: 'POST',
  body: formData
})
</script>
