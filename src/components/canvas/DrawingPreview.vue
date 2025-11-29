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
      stroke-width="2"
      stroke-dasharray="5,5"
    />
    
    <path
      v-if="tool === 'diamond'"
      :d="getPreviewDiamondPath()"
      fill="rgba(33, 150, 243, 0.2)"
      stroke="#2196f3"
      stroke-width="2"
      stroke-dasharray="5,5"
    />
    
    <line
      v-if="tool === 'arrow'"
      :x1="startPoint.x"
      :y1="startPoint.y"
      :x2="currentPoint.x"
      :y2="currentPoint.y"
      stroke="#2196f3"
      stroke-width="2"
      stroke-dasharray="5,5"
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
}

const props = defineProps<Props>()

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