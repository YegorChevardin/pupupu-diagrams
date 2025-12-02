<template>
  <g :transform="getDrawingPathTransform(drawingPath)">
    <!-- Main drawing path -->
    <path
      :d="pathData"
      fill="none"
      :stroke="isSelected ? '#0078d4' : getDrawingPathColor"
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
    
    <!-- Resize handle for selected path -->
    <g v-if="isSelected">
      <!-- Larger clickable area -->
      <rect
        :x="drawingPath.maxX! - Math.max(6, 10 / zoom)"
        :y="drawingPath.maxY! - Math.max(6, 10 / zoom)"
        :width="Math.max(12, 20 / zoom)"
        :height="Math.max(12, 20 / zoom)"
        fill="transparent"
        class="resize-handle-area"
        style="cursor: nwse-resize;"
        @mousedown.stop="$emit('startResize', drawingPath, 'bottom-right', $event)"
      />
      <!-- Visible handle -->
      <rect
        :x="drawingPath.maxX! - Math.max(4, 6 / zoom)"
        :y="drawingPath.maxY! - Math.max(4, 6 / zoom)"
        :width="Math.max(8, 12 / zoom)"
        :height="Math.max(8, 12 / zoom)"
        fill="#0078d4"
        stroke="white"
        :stroke-width="Math.max(1, 2 / zoom)"
        class="resize-handle-visual"
        style="pointer-events: none;"
        rx="1"
      />
      <!-- Corner indicator lines -->
      <line
        :x1="drawingPath.maxX!"
        :y1="drawingPath.maxY! - Math.max(8, 12 / zoom)"
        :x2="drawingPath.maxX!"
        :y2="drawingPath.maxY!"
        stroke="#0078d4"
        :stroke-width="Math.max(1, 2 / zoom)"
        style="pointer-events: none;"
      />
      <line
        :x1="drawingPath.maxX! - Math.max(8, 12 / zoom)"
        :y1="drawingPath.maxY!"
        :x2="drawingPath.maxX!"
        :y2="drawingPath.maxY!"
        stroke="#0078d4"
        :stroke-width="Math.max(1, 2 / zoom)"
        style="pointer-events: none;"
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
import { useTheme } from '../../composables/useTheme'

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

const { theme } = useTheme()

// Check if drawing path color should adapt to theme (black, white, or theme defaults)
const isThemeDependentColor = (color?: string) => {
  if (!color) return true
  const normalized = color.toLowerCase()
  return normalized === '#000000' || normalized === 'black' ||
         normalized === '#ffffff' || normalized === 'white' ||
         normalized === '#e2e8f0' // dark mode default
}

const getDrawingPathColor = computed(() => {
  if (isThemeDependentColor(props.drawingPath.stroke)) {
    return theme.value === 'dark' ? '#e2e8f0' : '#000000'
  }
  return props.drawingPath.stroke || (theme.value === 'dark' ? '#e2e8f0' : '#000000')
})

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

</script>

<style scoped>
.drawing-path {
  cursor: pointer;
}

.drawing-path:hover {
  filter: brightness(1.1);
  opacity: 0.8;
}

.resize-handle-area {
  cursor: nwse-resize;
}

.resize-handle-visual {
  pointer-events: none;
  transition: all 0.15s ease;
}

.resize-handle-area:hover ~ .resize-handle-visual {
  fill: #60a5fa;
  transform: scale(1.1);
}
</style>