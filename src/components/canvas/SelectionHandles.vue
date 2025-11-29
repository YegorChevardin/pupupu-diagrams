<template>
  <g v-if="selectedShape">
    <circle
      v-for="handle in getSelectionHandles(selectedShape)"
      :key="handle.type"
      :cx="handle.x"
      :cy="handle.y"
      r="4"
      fill="#2196f3"
      stroke="#ffffff"
      stroke-width="1"
      :class="['selection-handle', `handle-${handle.type}`]"
      @mousedown="$emit('startResize', $event, handle.type)"
    />
  </g>
</template>

<script setup lang="ts">
import type { Shape } from '../../stores/diagram'

interface Props {
  selectedShape: Shape | null
}

defineProps<Props>()
defineEmits<{
  startResize: [event: MouseEvent, handleType: string]
}>()

const getSelectionHandles = (shape: Shape | null) => {
  if (!shape) return []
  
  return [
    { type: 'nw', x: shape.x, y: shape.y },
    { type: 'ne', x: shape.x + shape.width, y: shape.y },
    { type: 'sw', x: shape.x, y: shape.y + shape.height },
    { type: 'se', x: shape.x + shape.width, y: shape.y + shape.height }
  ]
}
</script>

<style scoped>
.selection-handle {
  cursor: pointer;
}

.handle-nw {
  cursor: nw-resize;
}

.handle-ne {
  cursor: ne-resize;
}

.handle-sw {
  cursor: sw-resize;
}

.handle-se {
  cursor: se-resize;
}

.selection-handle:hover {
  fill: #1976d2;
  transform: scale(1.2);
}
</style>