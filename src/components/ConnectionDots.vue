<template>
  <g v-if="showDots && shape">
    <circle
      v-for="point in connectionPoints"
      :key="point.id"
      :cx="point.x"
      :cy="point.y"
      :r="dotSize"
      :fill="dotColor"
      :stroke="strokeColor"
      :stroke-width="1"
      class="connection-dot"
      @mouseenter="onDotHover(point)"
      @mouseleave="onDotLeave"
    />
  </g>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
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
</script>

<style scoped>
.connection-dot {
  cursor: crosshair;
  transition: all 0.2s ease;
}

.connection-dot:hover {
  r: 6;
  fill: #60a5fa;
}
</style>