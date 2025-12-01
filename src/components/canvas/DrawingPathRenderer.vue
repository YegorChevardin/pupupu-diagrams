<template>
  <g :transform="getDrawingPathTransform(drawingPath)">
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
        v-for="handle in getRotatedResizeHandles()"
        :key="handle.id"
        :cx="handle.x"
        :cy="handle.y"
        :r="Math.max(4, 6 / zoom)"
        fill="#0078d4"
        stroke="white"
        stroke-width="2"
        class="resize-handle"
        :style="`cursor: ${handle.cursor};`"
        @mousedown.stop="$emit('startResize', drawingPath, handle.id, $event)"
      />
      
      <!-- Rotation Handle -->
      <line
        :x1="(drawingPath.minX! + drawingPath.maxX!) / 2"
        :y1="drawingPath.minY! - Math.max(15, 30 / zoom)"
        :x2="(drawingPath.minX! + drawingPath.maxX!) / 2"
        :y2="drawingPath.minY! - Math.max(5, 10 / zoom)"
        stroke="#0078d4"
        :stroke-width="Math.max(1, 2 / zoom)"
      />
      <circle
        :cx="(drawingPath.minX! + drawingPath.maxX!) / 2"
        :cy="drawingPath.minY! - Math.max(15, 30 / zoom)"
        :r="Math.max(4, 6 / zoom)"
        fill="white"
        stroke="#0078d4"
        stroke-width="2"
        class="rotation-handle"
        @mousedown.stop="$emit('startRotate', drawingPath, $event)"
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
  startRotate: [drawingPath: DrawingPath, event: MouseEvent]
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

const getDrawingPathTransform = (drawingPath: DrawingPath) => {
  if (!drawingPath.rotation) return ''
  const centerX = ((drawingPath.minX || 0) + (drawingPath.maxX || 0)) / 2
  const centerY = ((drawingPath.minY || 0) + (drawingPath.maxY || 0)) / 2
  return `rotate(${drawingPath.rotation} ${centerX} ${centerY})`
}

const getRotatedResizeHandles = () => {
  const handles = [
    { id: 'top-left', x: props.drawingPath.minX!, y: props.drawingPath.minY!, cursor: 'nw-resize' },
    { id: 'top-right', x: props.drawingPath.maxX!, y: props.drawingPath.minY!, cursor: 'ne-resize' },
    { id: 'bottom-right', x: props.drawingPath.maxX!, y: props.drawingPath.maxY!, cursor: 'se-resize' },
    { id: 'bottom-left', x: props.drawingPath.minX!, y: props.drawingPath.maxY!, cursor: 'sw-resize' }
  ]

  // Apply rotation transformation if drawing path is rotated
  if (props.drawingPath.rotation && props.drawingPath.rotation !== 0) {
    const rotation = (props.drawingPath.rotation * Math.PI) / 180 // Convert to radians
    const centerX = ((props.drawingPath.minX || 0) + (props.drawingPath.maxX || 0)) / 2
    const centerY = ((props.drawingPath.minY || 0) + (props.drawingPath.maxY || 0)) / 2
    
    // Rotate each handle around the drawing path's center
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