<template>
  <g :transform="getShapeTransform(shape)">
    <rect
      v-if="shape.type === 'rectangle' && isSelected"
      :x="shape.x - Math.max(1, 2 / props.zoom)"
      :y="shape.y - Math.max(1, 2 / props.zoom)"
      :width="shape.width + Math.max(2, 4 / props.zoom)"
      :height="shape.height + Math.max(2, 4 / props.zoom)"
      fill="none"
      stroke="#0078d4"
      :stroke-width="Math.max(1, 2 / props.zoom)"
      :stroke-dasharray="`${Math.max(2, 4 / props.zoom)},${Math.max(2, 4 / props.zoom)}`"
    />
    
    <rect
      v-if="shape.type === 'rectangle'"
      :x="shape.x"
      :y="shape.y"
      :width="shape.width"
      :height="shape.height"
      :fill="shape.fill || 'white'"
      :stroke="isSelected ? '#0078d4' : '#cccccc'"
      :stroke-width="isSelected ? Math.max(1, 2 / props.zoom) : Math.max(0.5, 1 / props.zoom)"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
    />
    
    <path
      v-if="shape.type === 'diamond' && isSelected"
      :d="getDiamondOutlinePath(shape, props.zoom)"
      fill="none"
      stroke="#0078d4"
      :stroke-width="Math.max(1, 2 / props.zoom)"
      :stroke-dasharray="`${Math.max(2, 4 / props.zoom)},${Math.max(2, 4 / props.zoom)}`"
    />
    
    <path
      v-if="shape.type === 'diamond'"
      :d="getDiamondPath(shape)"
      :fill="shape.fill || 'white'"
      :stroke="isSelected ? '#0078d4' : '#cccccc'"
      :stroke-width="isSelected ? Math.max(1, 2 / props.zoom) : Math.max(0.5, 1 / props.zoom)"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
    />
    
    <rect
      v-if="shape.type === 'text' && isSelected"
      :x="shape.x - Math.max(2, 4 / props.zoom)"
      :y="shape.y - (shape.fontSize ?? 14) - Math.max(1, 2 / props.zoom)"
      :width="((shape.text?.length || 20) * (shape.fontSize ?? 14) * 0.6) + Math.max(4, 8 / props.zoom)"
      :height="(shape.fontSize ?? 14) + Math.max(3, 6 / props.zoom)"
      fill="rgba(0, 120, 212, 0.2)"
      stroke="#0078d4"
      :stroke-width="Math.max(0.5, 1 / props.zoom)"
      :stroke-dasharray="`${Math.max(1, 2 / props.zoom)},${Math.max(1, 2 / props.zoom)}`"
      :rx="Math.max(1, 2 / props.zoom)"
    />
    
    <text
      v-if="shape.type === 'text'"
      :x="shape.x"
      :y="shape.y"
      :fill="isSelected ? '#0078d4' : '#000000'"
      :font-size="shape.fontSize ?? 14"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
      class="shape-text"
    >
      {{ shape.text || 'Double-click to edit' }}
    </text>
    
    <text
      v-if="shape.type === 'rectangle' && shape.text"
      :x="shape.x + shape.width / 2"
      :y="shape.y + shape.height / 2"
      :fill="isSelected ? '#0078d4' : '#000000'"
      :font-size="shape.fontSize ?? 14"
      text-anchor="middle"
      dominant-baseline="middle"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
      class="shape-text"
    >
      {{ shape.text }}
    </text>
    
    <text
      v-if="shape.type === 'diamond' && shape.text"
      :x="shape.x + shape.width / 2"
      :y="shape.y + shape.height / 2"
      :fill="isSelected ? '#0078d4' : '#000000'"
      :font-size="shape.fontSize ?? 14"
      text-anchor="middle"
      dominant-baseline="middle"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
      class="shape-text"
    >
      {{ shape.text }}
    </text>
    
    <!-- Rotation Handle -->
    <g v-if="isSelected">
      <line
        :x1="shape.x + shape.width / 2"
        :y1="shape.y - Math.max(15, 30 / props.zoom)"
        :x2="shape.x + shape.width / 2"
        :y2="shape.y - Math.max(5, 10 / props.zoom)"
        stroke="#0078d4"
        :stroke-width="Math.max(1, 2 / props.zoom)"
      />
      <circle
        :cx="shape.x + shape.width / 2"
        :cy="shape.y - Math.max(15, 30 / props.zoom)"
        :r="Math.max(4, 8 / props.zoom)"
        fill="white"
        stroke="#0078d4"
        :stroke-width="Math.max(1, 2 / props.zoom)"
        class="rotation-handle"
        @mousedown.stop="$emit('startRotate', shape, $event)"
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import type { Shape } from '../../stores/diagram'

interface Props {
  shape: Shape
  isSelected: boolean
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})
defineEmits<{
  select: [shape: Shape, event: MouseEvent]
  editText: [shape: Shape]
  startRotate: [shape: Shape, event: MouseEvent]
}>()

const getDiamondPath = (shape: Shape) => {
  const cx = shape.x + shape.width / 2
  const cy = shape.y + shape.height / 2
  const hw = shape.width / 2
  const hh = shape.height / 2
  
  return `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`
}

const getDiamondOutlinePath = (shape: Shape, zoom: number = 1) => {
  const cx = shape.x + shape.width / 2
  const cy = shape.y + shape.height / 2
  const offset = Math.max(1, 2 / zoom)
  const hw = shape.width / 2 + offset
  const hh = shape.height / 2 + offset
  
  return `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`
}

const getShapeTransform = (shape: Shape) => {
  if (!shape.rotation) return ''
  const centerX = shape.x + shape.width / 2
  const centerY = shape.y + shape.height / 2
  return `rotate(${shape.rotation} ${centerX} ${centerY})`
}
</script>

<style scoped>
.shape-text {
  cursor: pointer;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>