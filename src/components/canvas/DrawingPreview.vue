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
    
    <path
      v-if="tool === 'diamond'"
      :d="getPreviewDiamondPath()"
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
  </g>
</template>

<script setup lang="ts">
interface Props {
  isDrawing: boolean
  tool: string
  startPoint: { x: number; y: number }
  currentPoint: { x: number; y: number }
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

const getPreviewDiamondPath = () => {
  const x = Math.min(props.startPoint.x, props.currentPoint.x)
  const y = Math.min(props.startPoint.y, props.currentPoint.y)
  const width = Math.abs(props.currentPoint.x - props.startPoint.x)
  const height = Math.abs(props.currentPoint.y - props.startPoint.y)
  
  const cx = x + width / 2
  const cy = y + height / 2
  const hw = width / 2
  const hh = height / 2
  
  return `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`
}
</script>