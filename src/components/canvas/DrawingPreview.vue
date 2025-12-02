<template>
  <g v-if="isDrawing">
    <rect
      v-if="tool === 'rectangle'"
      :x="getRectPreview().x"
      :y="getRectPreview().y"
      :width="getRectPreview().width"
      :height="getRectPreview().height"
      fill="rgba(33, 150, 243, 0.2)"
      stroke="#2196f3"
      :stroke-width="Math.max(1, 2 / zoom)"
      :stroke-dasharray="`${Math.max(3, 5 / zoom)},${Math.max(3, 5 / zoom)}`"
    />
    
    <ellipse
      v-if="tool === 'circle'"
      :cx="getEllipsePreview().cx"
      :cy="getEllipsePreview().cy"
      :rx="getEllipsePreview().rx"
      :ry="getEllipsePreview().ry"
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
    
    <rect
      v-if="tool === 'sticker'"
      :x="getStickerPreview().x"
      :y="getStickerPreview().y"
      :width="getStickerPreview().size"
      :height="getStickerPreview().size"
      fill="rgba(254, 240, 138, 0.6)"
      stroke="#fbbf24"
      :stroke-width="Math.max(1, 2 / zoom)"
      :stroke-dasharray="`${Math.max(3, 5 / zoom)},${Math.max(3, 5 / zoom)}`"
      :rx="Math.max(2, 4 / zoom)"
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
  isShiftPressed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1,
  isShiftPressed: false
})

const getRectPreview = () => {
  let width = Math.abs(props.currentPoint.x - props.startPoint.x)
  let height = Math.abs(props.currentPoint.y - props.startPoint.y)
  
  if (props.isShiftPressed) {
    const size = Math.max(width, height)
    width = size
    height = size
  }
  
  const directionX = props.currentPoint.x >= props.startPoint.x ? 1 : -1
  const directionY = props.currentPoint.y >= props.startPoint.y ? 1 : -1
  
  let x, y
  if (props.isShiftPressed) {
    x = directionX > 0 ? props.startPoint.x : props.startPoint.x - width
    y = directionY > 0 ? props.startPoint.y : props.startPoint.y - height
  } else {
    x = Math.min(props.startPoint.x, props.currentPoint.x)
    y = Math.min(props.startPoint.y, props.currentPoint.y)
  }
  
  return { x, y, width, height }
}

const getEllipsePreview = () => {
  let width = Math.abs(props.currentPoint.x - props.startPoint.x)
  let height = Math.abs(props.currentPoint.y - props.startPoint.y)
  
  if (props.isShiftPressed) {
    const size = Math.max(width, height)
    width = size
    height = size
  }
  
  const directionX = props.currentPoint.x >= props.startPoint.x ? 1 : -1
  const directionY = props.currentPoint.y >= props.startPoint.y ? 1 : -1
  
  let cx, cy
  if (props.isShiftPressed) {
    cx = directionX > 0 ? props.startPoint.x + width / 2 : props.startPoint.x - width / 2
    cy = directionY > 0 ? props.startPoint.y + height / 2 : props.startPoint.y - height / 2
  } else {
    cx = (props.startPoint.x + props.currentPoint.x) / 2
    cy = (props.startPoint.y + props.currentPoint.y) / 2
  }
  
  return { 
    cx, 
    cy, 
    rx: width / 2, 
    ry: height / 2 
  }
}

const getStickerPreview = () => {
  const size = Math.max(
    Math.abs(props.currentPoint.x - props.startPoint.x),
    Math.abs(props.currentPoint.y - props.startPoint.y)
  )
  
  const directionX = props.currentPoint.x >= props.startPoint.x ? 1 : -1
  const directionY = props.currentPoint.y >= props.startPoint.y ? 1 : -1
  
  const x = directionX > 0 ? props.startPoint.x : props.startPoint.x - size
  const y = directionY > 0 ? props.startPoint.y : props.startPoint.y - size
  
  return { x, y, size }
}

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