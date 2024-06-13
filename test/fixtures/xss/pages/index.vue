<template>
  <div>basic</div>
  <div>
    <button @click="onClick">
      Click to emit event
    </button>
  </div>
</template>

<script lang="ts" setup>
const io = useIO()

const onClick = () => {
  const socket = io()

  socket.on('connect', () => {
    socket.emit('id:req', (res) => {
      console.log(res)
    })
  })
}
</script>
