<template>
  <g>
    <defs>
      <pattern id="gridPatternLight" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e1e1e1" stroke-width="0.5" opacity="0.8"/>
      </pattern>
      <pattern id="gridPatternDark" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.6"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="isDark ? '#1e293b' : '#f5f5f5'">
      <animate attributeName="fill" :from="isDark ? '#f5f5f5' : '#1e293b'" :to="isDark ? '#1e293b' : '#f5f5f5'" dur="0.3s" fill="freeze" v-if="themeChanged"/>
    </rect>
    <rect width="100%" height="100%" :fill="isDark ? 'url(#gridPatternDark)' : 'url(#gridPatternLight)'"/>
  </g>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTheme } from '../../composables/useTheme'

const { theme } = useTheme()
const isDark = ref(theme.value === 'dark')
const themeChanged = ref(false)

watch(theme, (newTheme) => {
  isDark.value = newTheme === 'dark'
  themeChanged.value = true
  setTimeout(() => {
    themeChanged.value = false
  }, 300)
})
</script>