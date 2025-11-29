<template>
  <g>
    <defs>
      <pattern id="gridPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e1e1e1" stroke-width="0.5" opacity="0.8"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="#f5f5f5"/>
    <rect width="100%" height="100%" fill="url(#gridPattern)"/>
  </g>
</template>

<script setup lang="ts">
</script>