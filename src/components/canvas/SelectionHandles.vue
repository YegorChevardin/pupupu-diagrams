<template>
  <g v-if="selectedShape">
    <!-- Main resize handle in bottom-right corner -->
    <g :transform="getHandleTransform()">
      <!-- Larger clickable area -->
      <rect
        :x="selectedShape.x + selectedShape.width - Math.max(6, 10 / props.zoom)"
        :y="selectedShape.y + selectedShape.height - Math.max(6, 10 / props.zoom)"
        :width="Math.max(12, 20 / props.zoom)"
        :height="Math.max(12, 20 / props.zoom)"
        fill="transparent"
        class="resize-handle-area"
        style="cursor: nwse-resize;"
        @mousedown.stop="$emit('startResize', $event, 'se')"
      />
      <!-- Visible handle -->
      <rect
        :x="selectedShape.x + selectedShape.width - Math.max(4, 6 / props.zoom)"
        :y="selectedShape.y + selectedShape.height - Math.max(4, 6 / props.zoom)"
        :width="Math.max(8, 12 / props.zoom)"
        :height="Math.max(8, 12 / props.zoom)"
        fill="#2196f3"
        stroke="#ffffff"
        :stroke-width="Math.max(1, 2 / props.zoom)"
        class="resize-handle-visual"
        style="pointer-events: none;"
        rx="1"
      />
      <!-- Corner indicator lines -->
      <line
        :x1="selectedShape.x + selectedShape.width"
        :y1="selectedShape.y + selectedShape.height - Math.max(8, 12 / props.zoom)"
        :x2="selectedShape.x + selectedShape.width"
        :y2="selectedShape.y + selectedShape.height"
        stroke="#2196f3"
        :stroke-width="Math.max(1, 2 / props.zoom)"
        style="pointer-events: none;"
      />
      <line
        :x1="selectedShape.x + selectedShape.width - Math.max(8, 12 / props.zoom)"
        :y1="selectedShape.y + selectedShape.height"
        :x2="selectedShape.x + selectedShape.width"
        :y2="selectedShape.y + selectedShape.height"
        stroke="#2196f3"
        :stroke-width="Math.max(1, 2 / props.zoom)"
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

const getHandleTransform = () => {
  if (!props.selectedShape || !props.selectedShape.rotation) return ''
  const centerX = props.selectedShape.x + props.selectedShape.width / 2
  const centerY = props.selectedShape.y + props.selectedShape.height / 2
  return `rotate(${props.selectedShape.rotation} ${centerX} ${centerY})`
}
</script>

<style scoped>
.resize-handle-area {
  cursor: nwse-resize;
}

.resize-handle-visual {
  pointer-events: none;
  transition: all 0.15s ease;
}

.resize-handle-area:hover ~ .resize-handle-visual {
  fill: #1976d2;
  transform: scale(1.1);
}
</style>