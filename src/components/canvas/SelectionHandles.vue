<template>
  <g v-if="selectedShape">
    <g v-for="handle in getSelectionHandles(selectedShape)" :key="handle.type">
      <circle
        :cx="handle.x"
        :cy="handle.y"
        :r="Math.max(8, 12 / props.zoom)"
        fill="transparent"
        :class="['selection-handle-area', `handle-${handle.type}`]"
        @mousedown.stop="$emit('startResize', $event, handle.type)"
      />
      <circle
        :cx="handle.x"
        :cy="handle.y"
        :r="Math.max(3, 4 / props.zoom)"
        fill="#2196f3"
        stroke="#ffffff"
        :stroke-width="Math.max(0.5, 1 / props.zoom)"
        :class="['selection-handle-visual', `handle-${handle.type}`]"
        style="pointer-events: none;"
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import type { Shape } from '../../stores/diagram'

interface Props {
  selectedShape: Shape | null
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

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
.selection-handle-area {
  cursor: pointer;
}

.selection-handle-visual {
  pointer-events: none;
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

.selection-handle-area:hover + .selection-handle-visual {
  fill: #1976d2;
}
</style>