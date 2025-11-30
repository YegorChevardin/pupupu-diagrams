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
      :style="{ cursor: arrowCursor }"
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
      :style="{ cursor: arrowCursor }"
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
      <!-- Invisible larger interaction area for start handle -->
      <circle
        :cx="arrow.startX"
        :cy="arrow.startY"
        :r="Math.max(12, 16 / props.zoom)"
        fill="transparent"
        style="cursor: move; pointer-events: all;"
        @mousedown.stop.prevent="handleDragStart('start', $event)"
        @click.stop.prevent
        @mouseenter.stop="isHoveringHandle = true"
        @mouseleave.stop="isHoveringHandle = false"
      />
      <!-- Visible start handle -->
      <circle
        :cx="arrow.startX"
        :cy="arrow.startY"
        :r="Math.max(8, 12 / props.zoom)"
        :fill="arrow.startShapeId ? '#ef4444' : '#10b981'"
        stroke="white"
        :stroke-width="Math.max(2, 4 / props.zoom)"
        :class="['arrow-handle', { 'linked': arrow.startShapeId, 'draggable': !arrow.startShapeId }]"
        style="pointer-events: none;"
      />
      <!-- Invisible larger interaction area for end handle -->
      <circle
        :cx="arrow.endX"
        :cy="arrow.endY"
        :r="Math.max(12, 16 / props.zoom)"
        fill="transparent"
        style="cursor: move; pointer-events: all;"
        @mousedown.stop.prevent="handleDragStart('end', $event)"
        @click.stop.prevent
        @mouseenter.stop="isHoveringHandle = true"
        @mouseleave.stop="isHoveringHandle = false"
      />
      <!-- Visible end handle -->
      <circle
        :cx="arrow.endX"
        :cy="arrow.endY"
        :r="Math.max(8, 12 / props.zoom)"
        :fill="arrow.endShapeId ? '#ef4444' : '#10b981'"
        stroke="white"
        :stroke-width="Math.max(2, 4 / props.zoom)"
        :class="['arrow-handle', { 'linked': arrow.endShapeId, 'draggable': !arrow.endShapeId }]"
        style="pointer-events: none;"
      />
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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

const emit = defineEmits<{
  select: [arrow: Arrow, event: MouseEvent]
  startMove: [arrow: Arrow, event: MouseEvent]
  startDrag: [arrow: Arrow, endpoint: 'start' | 'end', event: MouseEvent]
}>()

const isHoveringHandle = ref(false)

const handleDragStart = (endpoint: 'start' | 'end', event: MouseEvent) => {
  console.log('🟢 Handle drag started:', endpoint, 'for arrow:', props.arrow.id, 'event:', event.type)
  event.preventDefault()
  event.stopPropagation()
  
  isHoveringHandle.value = false // Clear hover state when dragging starts
  emit('startDrag', props.arrow, endpoint, event)
  console.log('🟢 Emitted startDrag event')
  return true
}

const arrowCursor = computed(() => {
  // Always use pointer for arrow body to avoid conflicts
  return 'pointer'
})

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
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.arrow-handle.linked {
  cursor: not-allowed !important;
  opacity: 0.7;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.arrow-handle.draggable {
  cursor: move !important;
  filter: drop-shadow(0 2px 6px rgba(16, 185, 129, 0.4));
}

/* Remove hover transforms to prevent bouncing */
.arrow-handle:hover {
  /* No transform to prevent instability */
}
</style>