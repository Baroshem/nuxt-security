<template>
  <NuxtPage />
</template>

<script setup>
const formData = new FormData()
formData.append('test', 'test')
const { data } = useFetch('/api/test', {
  method: 'POST',
  body: formData
})
// Permissions Policy Example

onMounted(async () => {
  navigator.geolocation.getCurrentPosition(
    () => {},
    (err) => console.error(err.message)
  )

  try {
    await navigator.mediaDevices.getUserMedia({ video: true })
  } catch (err) {
    console.error(err)
  }
})
</script>
