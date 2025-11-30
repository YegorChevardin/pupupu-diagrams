<template>
  <g v-if="showDots && shape">
    <circle
      v-for="point in connectionPoints"
      :key="point.id"
      :cx="point.x"
      :cy="point.y"
      :r="dotSize"
      :fill="getDotColor(point)"
      :stroke="getDotStroke(point)"
      :stroke-width="getDotStrokeWidth(point)"
      class="connection-dot"
      :class="{ 'connecting': diagramStore.connectionState.isConnecting, 'start-point': isStartPoint(point) }"
      @mouseenter="onDotHover(point)"
      @mouseleave="onDotLeave"
      @click.stop="onDotClick(point)"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDiagramStore, type Shape } from '../stores/diagram'

interface Props {
  shape: Shape
  showDots: boolean
  dotSize?: number
  dotColor?: string
  strokeColor?: string
}

interface Emits {
  dotHover: [point: { x: number, y: number, id: string }]
  dotLeave: []
}

const props = withDefaults(defineProps<Props>(), {
  dotSize: 4,
  dotColor: '#3b82f6',
  strokeColor: '#1e40af'
})

const emit = defineEmits<Emits>()

const diagramStore = useDiagramStore()

const connectionPoints = computed(() => {
  return diagramStore.getShapeConnectionPoints(props.shape)
})

const onDotHover = (point: { x: number, y: number, id: string }) => {
  emit('dotHover', point)
}

const onDotLeave = () => {
  emit('dotLeave')
}

const onDotClick = (point: { x: number, y: number, id: string }) => {
  if (diagramStore.connectionState.isConnecting) {
    // Complete the connection
    diagramStore.completeConnection(point, props.shape.id, point.id)
  } else {
    // Start a new connection
    diagramStore.startConnection(point, props.shape.id, point.id)
  }
}

const getDotColor = (point: { x: number, y: number, id: string }) => {
  if (isStartPoint(point)) return '#ef4444' // red for start point
  if (diagramStore.connectionState.isConnecting) return '#10b981' // green for available end points
  return props.dotColor
}

const getDotStroke = (point: { x: number, y: number, id: string }) => {
  if (isStartPoint(point)) return '#dc2626'
  if (diagramStore.connectionState.isConnecting) return '#059669'
  return props.strokeColor
}

const getDotStrokeWidth = (point: { x: number, y: number, id: string }) => {
  if (isStartPoint(point) || diagramStore.connectionState.isConnecting) return 2
  return 1
}

const isStartPoint = (point: { x: number, y: number, id: string }) => {
  const startPoint = diagramStore.connectionState.startPoint
  return startPoint && 
         startPoint.shapeId === props.shape.id && 
         startPoint.dotId === point.id
}
</script>

<style scoped>
.connection-dot {
  cursor: crosshair;
  transition: all 0.2s ease;
}

.connection-dot:hover {
  r: 6;
}

.connection-dot.connecting {
  cursor: pointer;
}

.connection-dot.start-point {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>