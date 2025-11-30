<template>
  <g>
    <!-- Main drawing path -->
    <path
      :d="pathData"
      fill="none"
      :stroke="isSelected ? '#0078d4' : (drawingPath.stroke || '#000000')"
      :stroke-width="isSelected ? Math.max(1.5, 3 / zoom) : Math.max(0.5, (drawingPath.strokeWidth || 2) / zoom)"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="drawing-path"
      @click="handlePathClick"
      @mousedown="handlePathMouseDown"
    />
    
    <!-- Bounding box for selection -->
    <rect
      v-if="isSelected"
      :x="drawingPath.minX! - 5"
      :y="drawingPath.minY! - 5"
      :width="(drawingPath.maxX! - drawingPath.minX!) + 10"
      :height="(drawingPath.maxY! - drawingPath.minY!) + 10"
      fill="none"
      stroke="#0078d4"
      stroke-width="1"
      stroke-dasharray="3,3"
      opacity="0.5"
      pointer-events="none"
    />
    
    <!-- Resize handles for selected path -->
    <g v-if="isSelected">
      <!-- Corner handles -->
      <circle
        :cx="drawingPath.minX!"
        :cy="drawingPath.minY!"
        :r="Math.max(4, 6 / zoom)"
        fill="#0078d4"
        stroke="white"
        stroke-width="2"
        class="resize-handle"
        style="cursor: nw-resize;"
        @mousedown.stop="$emit('startResize', drawingPath, 'top-left', $event)"
      />
      <circle
        :cx="drawingPath.maxX!"
        :cy="drawingPath.minY!"
        :r="Math.max(4, 6 / zoom)"
        fill="#0078d4"
        stroke="white"
        stroke-width="2"
        class="resize-handle"
        style="cursor: ne-resize;"
        @mousedown.stop="$emit('startResize', drawingPath, 'top-right', $event)"
      />
      <circle
        :cx="drawingPath.maxX!"
        :cy="drawingPath.maxY!"
        :r="Math.max(4, 6 / zoom)"
        fill="#0078d4"
        stroke="white"
        stroke-width="2"
        class="resize-handle"
        style="cursor: se-resize;"
        @mousedown.stop="$emit('startResize', drawingPath, 'bottom-right', $event)"
      />
      <circle
        :cx="drawingPath.minX!"
        :cy="drawingPath.maxY!"
        :r="Math.max(4, 6 / zoom)"
        fill="#0078d4"
        stroke="white"
        stroke-width="2"
        class="resize-handle"
        style="cursor: sw-resize;"
        @mousedown.stop="$emit('startResize', drawingPath, 'bottom-left', $event)"
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDiagramStore, type DrawingPath } from '../../stores/diagram'

const diagramStore = useDiagramStore()

interface Props {
  drawingPath: DrawingPath
  isSelected: boolean
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

const emit = defineEmits<{
  select: [drawingPath: DrawingPath, event: MouseEvent]
  startMove: [drawingPath: DrawingPath, event: MouseEvent]
  startResize: [drawingPath: DrawingPath, handle: string, event: MouseEvent]
}>()

const handlePathClick = (event: MouseEvent) => {
  if (diagramStore.tool === 'select') {
    event.stopPropagation()
    emit('select', props.drawingPath, event)
  }
}

const handlePathMouseDown = (event: MouseEvent) => {
  if (diagramStore.tool === 'select') {
    event.stopPropagation()
    emit('startMove', props.drawingPath, event)
  }
}

const pathData = computed(() => {
  if (props.drawingPath.points.length === 0) return ''
  
  const firstPoint = props.drawingPath.points[0]
  if (!firstPoint) return ''
  
  let path = `M ${firstPoint.x} ${firstPoint.y}`
  
  for (let i = 1; i < props.drawingPath.points.length; i++) {
    const point = props.drawingPath.points[i]
    if (point) {
      path += ` L ${point.x} ${point.y}`
    }
  }
  
  return path
})
</script>

<style scoped>
.drawing-path {
  cursor: pointer;
}

.drawing-path:hover {
  filter: brightness(1.1);
  opacity: 0.8;
}

.resize-handle {
  cursor: pointer;
}
</style>