<template>
  <g>
    <!-- Straight Arrow -->
    <line
      v-if="!arrow.isCurved"
      :x1="arrow.startX"
      :y1="arrow.startY"
      :x2="arrow.endX"
      :y2="arrow.endY"
      :stroke="isSelected ? '#0078d4' : (arrow.stroke || '#000000')"
      :stroke-width="isSelected ? Math.max(1.5, 3 / props.zoom) : Math.max(0.5, (arrow.strokeWidth || 1) / props.zoom)"
      :marker-end="isSelected ? 'url(#arrowhead-selected)' : getArrowMarker(arrow.stroke)"
      @click.stop="$emit('select', arrow, $event)"
      @mousedown.stop="$emit('startMove', arrow, $event)"
      @dblclick.stop="convertToCurved"
      @contextmenu.prevent.stop="convertToCurved"
      style="cursor: pointer;"
    />
    
    <!-- Curved Arrow -->
    <path
      v-if="arrow.isCurved && arrow.controlPoints"
      :d="generateCurvePath()"
      fill="none"
      :stroke="isSelected ? '#0078d4' : (arrow.stroke || '#000000')"
      :stroke-width="isSelected ? Math.max(1.5, 3 / props.zoom) : Math.max(0.5, (arrow.strokeWidth || 1) / props.zoom)"
      stroke-dasharray="5,5"
      :marker-end="isSelected ? 'url(#arrowhead-selected)' : getArrowMarker(arrow.stroke)"
      @click.stop="$emit('select', arrow, $event)"
      @mousedown.stop="$emit('startMove', arrow, $event)"
      style="cursor: pointer;"
    />
    
    <!-- Arrow Control Points for Curved Arrows -->
    <ArrowControlPoints
      v-if="isSelected && arrow.isCurved"
      :arrow="arrow"
      :zoom="props.zoom"
      :show-control-lines="true"
    />
    
    <!-- Start/End Handles -->
    <g v-if="isSelected">
      <circle
        :cx="arrow.startX"
        :cy="arrow.startY"
        :r="Math.max(2, 4 / props.zoom)"
        fill="#0078d4"
        stroke="white"
        :stroke-width="Math.max(0.5, 1 / props.zoom)"
        class="arrow-handle"
        @mousedown="$emit('startDrag', arrow, 'start', $event)"
      />
      <circle
        :cx="arrow.endX"
        :cy="arrow.endY"
        :r="Math.max(2, 4 / props.zoom)"
        fill="#0078d4"
        stroke="white"
        :stroke-width="Math.max(0.5, 1 / props.zoom)"
        class="arrow-handle"
        @mousedown="$emit('startDrag', arrow, 'end', $event)"
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import { useDiagramStore, type Arrow } from '../../stores/diagram'
import ArrowControlPoints from '../ArrowControlPoints.vue'

const diagramStore = useDiagramStore()

interface Props {
  arrow: Arrow
  isSelected: boolean
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})
defineEmits<{
  select: [arrow: Arrow, event: MouseEvent]
  startMove: [arrow: Arrow, event: MouseEvent]
  startDrag: [arrow: Arrow, endpoint: 'start' | 'end', event: MouseEvent]
}>()

const convertToCurved = () => {
  diagramStore.convertArrowToCurved(props.arrow.id)
}

const generateCurvePath = () => {
  if (!props.arrow.controlPoints || props.arrow.controlPoints.length === 0) {
    return `M ${props.arrow.startX} ${props.arrow.startY} L ${props.arrow.endX} ${props.arrow.endY}`
  }
  
  let path = `M ${props.arrow.startX} ${props.arrow.startY}`
  
  if (props.arrow.controlPoints.length === 1) {
    // Single control point - quadratic curve
    const cp = props.arrow.controlPoints[0]
    if (cp) {
      path += ` Q ${cp.x} ${cp.y} ${props.arrow.endX} ${props.arrow.endY}`
    }
  } else {
    // Multiple control points - create lines through each point
    const points = props.arrow.controlPoints.filter(cp => cp != null)
    
    for (const point of points) {
      if (point) {
        path += ` L ${point.x} ${point.y}`
      }
    }
    
    // Final line to end point
    path += ` L ${props.arrow.endX} ${props.arrow.endY}`
  }
  
  return path
}

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