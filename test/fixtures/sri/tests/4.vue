<template>
  <div>
    <p>
      Function generated {{ data }}
    </p>
  </div>
</template>
<script setup>
const { data } = await useFetch('/api/4')
</script>