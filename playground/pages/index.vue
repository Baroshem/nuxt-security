<template>
  {{ data }}
</template>

<script setup>
import { useAsyncData } from '#app';

const { data } = await useAsyncData(() => 'Home')
</script>
