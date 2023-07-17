<template>
  <div>
    test
  </div>
</template>

<script setup>
useHead({
  script: [
    { innerHTML: "var inlineLiteral = '\x3Cscript>console.log(\"example\")'" }
  ]
}, { mode: 'server' })
</script>
