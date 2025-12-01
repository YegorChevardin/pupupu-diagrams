<template>
  <g v-if="isDrawing">
    <rect
      v-if="tool === 'rectangle'"
      :x="Math.min(startPoint.x, currentPoint.x)"
      :y="Math.min(startPoint.y, currentPoint.y)"
      :width="Math.abs(currentPoint.x - startPoint.x)"
      :height="Math.abs(currentPoint.y - startPoint.y)"
      fill="rgba(33, 150, 243, 0.2)"
      stroke="#2196f3"
      :stroke-width="Math.max(1, 2 / zoom)"
      :stroke-dasharray="`${Math.max(3, 5 / zoom)},${Math.max(3, 5 / zoom)}`"
    />
    
    <ellipse
      v-if="tool === 'circle'"
      :cx="(startPoint.x + currentPoint.x) / 2"
      :cy="(startPoint.y + currentPoint.y) / 2"
      :rx="Math.abs(currentPoint.x - startPoint.x) / 2"
      :ry="Math.abs(currentPoint.y - startPoint.y) / 2"
      fill="rgba(33, 150, 243, 0.2)"
      stroke="#2196f3"
      :stroke-width="Math.max(1, 2 / zoom)"
      :stroke-dasharray="`${Math.max(3, 5 / zoom)},${Math.max(3, 5 / zoom)}`"
    />
    
    <line
      v-if="tool === 'arrow'"
      :x1="startPoint.x"
      :y1="startPoint.y"
      :x2="currentPoint.x"
      :y2="currentPoint.y"
      stroke="#2196f3"
      :stroke-width="Math.max(1, 2 / zoom)"
      :stroke-dasharray="`${Math.max(3, 5 / zoom)},${Math.max(3, 5 / zoom)}`"
      marker-end="url(#arrowhead-preview)"
    />
    
    <path
      v-if="tool === 'pencil' && pencilPoints && pencilPoints.length > 0"
      :d="getPencilPreviewPath()"
      fill="none"
      stroke="#2196f3"
      :stroke-width="Math.max(1, 2 / zoom)"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.7"
    />
  </g>
</template>

<script setup lang="ts">
interface Props {
  isDrawing: boolean
  tool: string
  startPoint: { x: number; y: number }
  currentPoint: { x: number; y: number }
  pencilPoints?: Array<{ x: number, y: number }>
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

const getPencilPreviewPath = () => {
  if (!props.pencilPoints || props.pencilPoints.length === 0) return ''
  
  const firstPoint = props.pencilPoints[0]
  if (!firstPoint) return ''
  
  let path = `M ${firstPoint.x} ${firstPoint.y}`
  
  for (let i = 1; i < props.pencilPoints.length; i++) {
    const point = props.pencilPoints[i]
    if (point) {
      path += ` L ${point.x} ${point.y}`
    }
  }
  
  return path
}
</script>