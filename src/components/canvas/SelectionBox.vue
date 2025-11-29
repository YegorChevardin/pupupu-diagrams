<template>
  <rect
    v-if="isSelecting"
    :x="Math.min(selectionStart.x, selectionEnd.x)"
    :y="Math.min(selectionStart.y, selectionEnd.y)"
    :width="Math.abs(selectionEnd.x - selectionStart.x)"
    :height="Math.abs(selectionEnd.y - selectionStart.y)"
    fill="rgba(0, 120, 215, 0.15)"
    stroke="#0078d4"
    :stroke-width="Math.max(0.5, 1 / props.zoom)"
    :stroke-dasharray="`${Math.max(1, 2 / props.zoom)},${Math.max(1, 2 / props.zoom)}`"
  />
</template>

<script setup lang="ts">
interface Props {
  isSelecting: boolean
  selectionStart: { x: number; y: number }
  selectionEnd: { x: number; y: number }
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})
</script>