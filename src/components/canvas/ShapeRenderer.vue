<template>
  <g>
    <rect
      v-if="shape.type === 'rectangle' && isSelected"
      :x="shape.x - 2"
      :y="shape.y - 2"
      :width="shape.width + 4"
      :height="shape.height + 4"
      fill="none"
      stroke="#0078d4"
      stroke-width="2"
      stroke-dasharray="4,4"
    />
    
    <rect
      v-if="shape.type === 'rectangle'"
      :x="shape.x"
      :y="shape.y"
      :width="shape.width"
      :height="shape.height"
      :fill="shape.fill || 'white'"
      :stroke="isSelected ? '#0078d4' : '#cccccc'"
      :stroke-width="isSelected ? 2 : 1"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
    />
    
    <path
      v-if="shape.type === 'diamond' && isSelected"
      :d="getDiamondOutlinePath(shape)"
      fill="none"
      stroke="#0078d4"
      stroke-width="2"
      stroke-dasharray="4,4"
    />
    
    <path
      v-if="shape.type === 'diamond'"
      :d="getDiamondPath(shape)"
      :fill="shape.fill || 'white'"
      :stroke="isSelected ? '#0078d4' : '#cccccc'"
      :stroke-width="isSelected ? 2 : 1"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
    />
    
    <rect
      v-if="shape.type === 'text' && isSelected"
      :x="shape.x - 4"
      :y="shape.y - (shape.fontSize ?? 14) - 2"
      :width="((shape.text?.length || 20) * (shape.fontSize ?? 14) * 0.6) + 8"
      :height="(shape.fontSize ?? 14) + 6"
      fill="rgba(0, 120, 212, 0.2)"
      stroke="#0078d4"
      stroke-width="1"
      stroke-dasharray="2,2"
      rx="2"
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
  </g>
</template>

<script setup lang="ts">
import type { Shape } from '../../stores/diagram'

interface Props {
  shape: Shape
  isSelected: boolean
}

defineProps<Props>()
defineEmits<{
  select: [shape: Shape, event: MouseEvent]
  editText: [shape: Shape]
}>()

const getDiamondPath = (shape: Shape) => {
  const cx = shape.x + shape.width / 2
  const cy = shape.y + shape.height / 2
  const hw = shape.width / 2
  const hh = shape.height / 2
  
  return `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`
}

const getDiamondOutlinePath = (shape: Shape) => {
  const cx = shape.x + shape.width / 2
  const cy = shape.y + shape.height / 2
  const hw = shape.width / 2 + 2
  const hh = shape.height / 2 + 2
  
  return `M ${cx} ${cy - hh} L ${cx + hw} ${cy} L ${cx} ${cy + hh} L ${cx - hw} ${cy} Z`
}
</script>

<style scoped>
.shape-text {
  cursor: pointer;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>