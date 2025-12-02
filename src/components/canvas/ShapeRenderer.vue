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
      :fill="getShapeFill"
      :stroke="isSelected ? '#0078d4' : getShapeStroke"
      :stroke-width="isSelected ? Math.max(1, 2 / props.zoom) : Math.max(0.5, 1 / props.zoom)"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
    />
    
    <ellipse
      v-if="shape.type === 'circle'"
      :cx="shape.x + shape.width / 2"
      :cy="shape.y + shape.height / 2"
      :rx="shape.width / 2"
      :ry="shape.height / 2"
      :fill="getShapeFill"
      :stroke="isSelected ? '#0078d4' : getShapeStroke"
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
      :fill="isSelected ? '#0078d4' : getTextColor"
      :font-size="shape.fontSize ?? 14"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
      class="shape-text"
    >
      {{ shape.text || 'Double-click to edit' }}
    </text>
    
    <text
      v-if="(shape.type === 'rectangle' || shape.type === 'circle') && shape.text"
      :x="shape.x + shape.width / 2"
      :y="shape.y + shape.height / 2"
      :fill="isSelected ? '#0078d4' : getTextColor"
      :font-size="shape.fontSize ?? 14"
      text-anchor="middle"
      dominant-baseline="middle"
      @click="$emit('select', shape, $event)"
      @dblclick="$emit('editText', shape)"
      class="shape-text"
    >
      {{ shape.text }}
    </text>
    
    <!-- Sticker -->
    <g v-if="shape.type === 'sticker'">
      <!-- Sticker background with selection outline -->
      <rect
        v-if="isSelected"
        :x="shape.x - Math.max(1, 2 / props.zoom)"
        :y="shape.y - Math.max(1, 2 / props.zoom)"
        :width="shape.width + Math.max(2, 4 / props.zoom)"
        :height="shape.height + Math.max(2, 4 / props.zoom)"
        fill="none"
        stroke="#0078d4"
        :stroke-width="Math.max(1, 2 / props.zoom)"
        :stroke-dasharray="`${Math.max(2, 4 / props.zoom)},${Math.max(2, 4 / props.zoom)}`"
        :rx="Math.max(2, 4 / props.zoom)"
      />
      
      <!-- Sticker background -->
      <rect
        :x="shape.x"
        :y="shape.y"
        :width="shape.width"
        :height="shape.height"
        :fill="getStickerColor(shape)"
        :stroke="isSelected ? '#0078d4' : 'none'"
        :stroke-width="isSelected ? Math.max(1, 2 / props.zoom) : 0"
        :rx="Math.max(2, 4 / props.zoom)"
        @click="$emit('select', shape, $event)"
        @dblclick="$emit('editText', shape)"
        style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
      />
      
      <!-- Sticker text -->
      <text
        :x="shape.x + shape.width / 2"
        :y="shape.y + shape.height / 2 - Math.max(8, 12 / props.zoom)"
        :fill="isSelected ? '#0078d4' : getStickerTextColor(shape)"
        :font-size="shape.fontSize ?? 14"
        text-anchor="middle"
        dominant-baseline="middle"
        @click="$emit('select', shape, $event)"
        @dblclick="$emit('editText', shape)"
        class="shape-text"
        style="font-weight: 600;"
      >
        {{ shape.text || 'Note' }}
      </text>
      
      <!-- Emoji in bottom-left corner -->
      <text
        :x="shape.x + Math.max(12, 20 / props.zoom)"
        :y="shape.y + shape.height - Math.max(12, 20 / props.zoom)"
        :font-size="Math.max(16, 24 / props.zoom)"
        text-anchor="middle"
        dominant-baseline="middle"
        @click="$emit('select', shape, $event)"
        style="pointer-events: none; user-select: none;"
      >
        {{ shape.emoji || '📌' }}
      </text>
    </g>
    
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
import { computed } from 'vue'
import { useTheme } from '../../composables/useTheme'
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

const { theme } = useTheme()

// Colors that should adapt to theme (black, white, and default grays)
const isThemeDependentFill = (color?: string) => {
  if (!color) return true
  const normalized = color.toLowerCase()
  return normalized === '#ffffff' || normalized === 'white' || 
         normalized === '#000000' || normalized === 'black' ||
         normalized === '#1e293b' // dark mode default
}

const isThemeDependentStroke = (color?: string) => {
  if (!color) return true
  const normalized = color.toLowerCase()
  return normalized === '#cccccc' || normalized === '#475569' || // default strokes
         normalized === '#000000' || normalized === 'black' ||
         normalized === '#ffffff' || normalized === 'white'
}

const isThemeDependentTextColor = (color?: string) => {
  if (!color) return true
  const normalized = color.toLowerCase()
  return normalized === '#000000' || normalized === 'black' ||
         normalized === '#ffffff' || normalized === 'white' ||
         normalized === '#e2e8f0' // dark mode text
}

const getShapeFill = computed(() => {
  if (isThemeDependentFill(props.shape.fill)) {
    return theme.value === 'dark' ? '#1e293b' : '#ffffff'
  }
  return props.shape.fill || (theme.value === 'dark' ? '#1e293b' : '#ffffff')
})

const getShapeStroke = computed(() => {
  if (isThemeDependentStroke(props.shape.stroke)) {
    return theme.value === 'dark' ? '#475569' : '#cccccc'
  }
  return props.shape.stroke || (theme.value === 'dark' ? '#475569' : '#cccccc')
})

const getTextColor = computed(() => {
  // For shapes, we don't have a separate text color property, so just use theme default
  return theme.value === 'dark' ? '#e2e8f0' : '#000000'
})

const getStickerColor = (shape: Shape) => {
  const colors = {
    yellow: '#fef08a',
    red: '#fca5a5',
    blue: '#93c5fd',
    green: '#86efac'
  }
  return colors[shape.stickerColor || 'yellow']
}

const getStickerTextColor = (shape: Shape) => {
  const colors = {
    yellow: '#854d0e',
    red: '#7f1d1d',
    blue: '#1e3a8a',
    green: '#14532d'
  }
  return colors[shape.stickerColor || 'yellow']
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