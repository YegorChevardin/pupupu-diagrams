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
  
  const handles = [
    { type: 'nw', x: shape.x, y: shape.y },
    { type: 'ne', x: shape.x + shape.width, y: shape.y },
    { type: 'sw', x: shape.x, y: shape.y + shape.height },
    { type: 'se', x: shape.x + shape.width, y: shape.y + shape.height }
  ]
  
  // Apply rotation transformation if shape is rotated
  if (shape.rotation && shape.rotation !== 0) {
    const rotation = (shape.rotation * Math.PI) / 180 // Convert to radians
    const centerX = shape.x + shape.width / 2
    const centerY = shape.y + shape.height / 2
    
    // Rotate each handle around the shape's center
    for (const handle of handles) {
      const dx = handle.x - centerX
      const dy = handle.y - centerY
      
      const rotatedX = dx * Math.cos(rotation) - dy * Math.sin(rotation)
      const rotatedY = dx * Math.sin(rotation) + dy * Math.cos(rotation)
      
      handle.x = rotatedX + centerX
      handle.y = rotatedY + centerY
    }
  }
  
  return handles
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