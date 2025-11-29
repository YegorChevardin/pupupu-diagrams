<template>
  <g>
    <line
      :x1="arrow.startX"
      :y1="arrow.startY"
      :x2="arrow.endX"
      :y2="arrow.endY"
      :stroke="isSelected ? '#0078d4' : (arrow.stroke || '#000000')"
      :stroke-width="isSelected ? 3 : (arrow.strokeWidth || 1)"
      :marker-end="isSelected ? 'url(#arrowhead-selected)' : getArrowMarker(arrow.stroke)"
      @click.stop="$emit('select', arrow, $event)"
      @mousedown.stop="$emit('startMove', arrow, $event)"
      style="cursor: pointer;"
    />
    
    <g v-if="isSelected">
      <circle
        :cx="arrow.startX"
        :cy="arrow.startY"
        r="4"
        fill="#0078d4"
        stroke="white"
        stroke-width="1"
        class="arrow-handle"
        @mousedown="$emit('startDrag', arrow, 'start', $event)"
      />
      <circle
        :cx="arrow.endX"
        :cy="arrow.endY"
        r="4"
        fill="#0078d4"
        stroke="white"
        stroke-width="1"
        class="arrow-handle"
        @mousedown="$emit('startDrag', arrow, 'end', $event)"
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import type { Arrow } from '../../stores/diagram'

interface Props {
  arrow: Arrow
  isSelected: boolean
}

defineProps<Props>()
defineEmits<{
  select: [arrow: Arrow, event: MouseEvent]
  startMove: [arrow: Arrow, event: MouseEvent]
  startDrag: [arrow: Arrow, endpoint: 'start' | 'end', event: MouseEvent]
}>()

const getArrowMarker = (color?: string) => {
  if (!color || color === '#000000') return 'url(#arrowhead-black)'
  
  const colorMap: { [key: string]: string } = {
    '#ff6b6b': 'url(#arrowhead-red)',
    '#4ecdc4': 'url(#arrowhead-teal)', 
    '#45b7d1': 'url(#arrowhead-blue)',
    '#96ceb4': 'url(#arrowhead-green)',
    '#feca57': 'url(#arrowhead-yellow)',
    '#ff9ff3': 'url(#arrowhead-pink)',
    '#54a0ff': 'url(#arrowhead-lightblue)'
  }
  
  return colorMap[color] || 'url(#arrowhead-black)'
}
</script>

<style scoped>
.arrow-handle {
  cursor: move;
}

.arrow-handle:hover {
  fill: #1976d2;
}
</style>