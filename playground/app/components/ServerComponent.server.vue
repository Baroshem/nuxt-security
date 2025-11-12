<template>
  <div>
    <h1>Server-only Nuxt-Island component</h1>
    <p>Nonce: <span id="server-nonce">{{ nonce }}</span></p>
  </div>
</template>

<script setup lang="ts">
const nonce = useNonce()
</script>