<template>
  <span :title="localTime">{{ fromNow }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { moment } from "vis-timeline/standalone";
const currentSecond = useCurrentSecond();
const props = defineProps({
  time: Number
})

// Hacky
const fromNow = computed(() => {
  return currentSecond.value !== null && moment(props.time).fromNow();
})
const localTime = computed(() => {
  return currentSecond.value !== null && moment(props.time).toLocaleString();
})
</script>