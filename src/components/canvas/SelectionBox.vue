<template>
  <rect
    v-if="isSelecting"
    :x="Math.min(selectionStart.x, selectionEnd.x)"
    :y="Math.min(selectionStart.y, selectionEnd.y)"
    :width="Math.abs(selectionEnd.x - selectionStart.x)"
    :height="Math.abs(selectionEnd.y - selectionStart.y)"
    :fill="isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(102, 126, 234, 0.15)'"
    :stroke="isDark ? '#818cf8' : '#667eea'"
    :stroke-width="Math.max(0.5, 1 / props.zoom)"
    :stroke-dasharray="`${Math.max(1, 2 / props.zoom)},${Math.max(1, 2 / props.zoom)}`"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTheme } from '../../composables/useTheme'

interface Props {
  isSelecting: boolean
  selectionStart: { x: number; y: number }
  selectionEnd: { x: number; y: number }
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

const { theme } = useTheme()
const isDark = ref(theme.value === 'dark')

watch(theme, (newTheme) => {
  isDark.value = newTheme === 'dark'
})
</script>