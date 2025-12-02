<template>
  <g v-if="arrow.isCurved && arrow.controlPoints">
    <!-- Control point handles -->
    <circle
      v-for="(point, index) in arrow.controlPoints"
      :key="point.id"
      :cx="point.x"
      :cy="point.y"
      :r="controlPointSize"
      :fill="isDark ? '#818cf8' : '#667eea'"
      :stroke="isDark ? '#6366f1' : '#764ba2'"
      :stroke-width="2"
      class="control-point"
      @mousedown="startDrag($event, point, index)"
      @dblclick="addPointAfter(index)"
      @contextmenu.prevent="removePoint(point.id)"
    />
    
    <!-- Control lines (visible when selected) -->
    <template v-if="showControlLines">
      <!-- Line from start to first control point -->
      <line
        v-if="arrow.controlPoints[0]"
        :x1="arrow.startX"
        :y1="arrow.startY"
        :x2="arrow.controlPoints[0].x"
        :y2="arrow.controlPoints[0].y"
        stroke="#94a3b8"
        stroke-width="1"
        stroke-dasharray="3,3"
        class="control-line"
      />
      
      <!-- Lines between control points -->
      <line
        v-for="(point, index) in arrow.controlPoints.slice(0, -1)"
        :key="`line-${point.id}`"
        :x1="point.x"
        :y1="point.y"
        :x2="arrow.controlPoints[index + 1]?.x"
        :y2="arrow.controlPoints[index + 1]?.y"
        stroke="#94a3b8"
        stroke-width="1"
        stroke-dasharray="3,3"
        class="control-line"
      />
      
      <!-- Line from last control point to end -->
      <line
        v-if="arrow.controlPoints[arrow.controlPoints.length - 1]"
        :x1="arrow.controlPoints[arrow.controlPoints.length - 1]?.x"
        :y1="arrow.controlPoints[arrow.controlPoints.length - 1]?.y"
        :x2="arrow.endX"
        :y2="arrow.endY"
        stroke="#94a3b8"
        stroke-width="1"
        stroke-dasharray="3,3"
        class="control-line"
      />
    </template>
  </g>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDiagramStore, type Arrow } from '../stores/diagram'
import { useTheme } from '../composables/useTheme'

interface Props {
  arrow: Arrow
  zoom: number
  showControlLines?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showControlLines: true
})

const diagramStore = useDiagramStore()
const { theme } = useTheme()
const isDark = ref(theme.value === 'dark')

watch(theme, (newTheme) => {
  isDark.value = newTheme === 'dark'
})

const controlPointSize = computed(() => 6 / props.zoom)

const startDrag = (event: MouseEvent, point: { x: number, y: number, id: string }, index: number) => {
  event.stopPropagation()
  
  const startX = event.clientX
  const startY = event.clientY
  const originalX = point.x
  const originalY = point.y
  
  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = (e.clientX - startX) / props.zoom
    const deltaY = (e.clientY - startY) / props.zoom
    
    diagramStore.updateControlPoint(
      props.arrow.id,
      point.id,
      originalX + deltaX,
      originalY + deltaY
    )
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const addPointAfter = (index: number) => {
  diagramStore.addControlPoint(props.arrow.id, index)
}

const removePoint = (pointId: string) => {
  if (props.arrow.controlPoints && props.arrow.controlPoints.length > 1) {
    diagramStore.removeControlPoint(props.arrow.id, pointId)
  }
}
</script>

<style scoped>
.control-point {
  cursor: move;
  transition: all 0.2s ease;
}

.control-point:hover {
  filter: brightness(1.2);
  transform: scale(1.3);
}

.control-line {
  pointer-events: none;
  opacity: 0.6;
}
</style>