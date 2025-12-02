<template>
  <defs>
    <marker
      id="arrowhead-black"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" :fill="defaultArrowColor" />
    </marker>
    
    <marker
      id="arrowhead-red"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#ff6b6b" />
    </marker>
    
    <marker
      id="arrowhead-teal"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#4ecdc4" />
    </marker>
    
    <marker
      id="arrowhead-blue"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#45b7d1" />
    </marker>
    
    <marker
      id="arrowhead-selected"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#0078d4" />
    </marker>
    
    <marker
      id="arrowhead-green"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#96ceb4" />
    </marker>
    
    <marker
      id="arrowhead-yellow"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#feca57" />
    </marker>
    
    <marker
      id="arrowhead-pink"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#ff9ff3" />
    </marker>
    
    <marker
      id="arrowhead-lightblue"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#54a0ff" />
    </marker>
    
    <marker
      id="arrowhead-preview"
      :markerWidth="markerSize.width"
      :markerHeight="markerSize.height"
      :refX="markerSize.refX"
      :refY="markerSize.refY"
      orient="auto"
      markerUnits="userSpaceOnUse"
    >
      <polygon :points="markerPoints" fill="#2196f3" />
    </marker>
  </defs>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../../composables/useTheme'

interface Props {
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1
})

const { theme } = useTheme()

// Default arrow color based on theme
const defaultArrowColor = computed(() => {
  return theme.value === 'dark' ? '#e2e8f0' : '#000000'
})

// Calculate zoom-independent marker size
const markerSize = computed(() => {
  const baseWidth = 10
  const baseHeight = 7
  const scaledWidth = Math.max(6, baseWidth / props.zoom)
  const scaledHeight = Math.max(4, baseHeight / props.zoom)
  
  return {
    width: scaledWidth,
    height: scaledHeight,
    refX: scaledWidth * 0.9, // 90% of width like original (9/10)
    refY: scaledHeight * 0.5  // 50% of height like original (3.5/7)
  }
})

// Calculate zoom-independent marker points
const markerPoints = computed(() => {
  const w = markerSize.value.width
  const h = markerSize.value.height
  return `0 0, ${w} ${h/2}, 0 ${h}`
})
</script>