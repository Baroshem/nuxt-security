<template>
  <NuxtPage />
</template>

<script setup>
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
