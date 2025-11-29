<template>
  <div v-if="visible" class="zoom-controls">
    <button @click="$emit('zoom-in')" class="zoom-btn" title="Zoom In">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19" stroke="currentColor" stroke-width="2"/>
        <path d="M5 12H19" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
    <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
    <button @click="$emit('zoom-out')" class="zoom-btn" title="Zoom Out">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
    <button @click="$emit('reset-zoom')" class="zoom-btn" title="Reset Zoom">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" stroke-width="2"/>
        <path d="M21 7V5C21 3.89543 20.1046 3 19 3H17" stroke="currentColor" stroke-width="2"/>
        <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" stroke-width="2"/>
        <path d="M17 21H19C20.1046 21 21 20.1046 21 19V17" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
    <button @click="toggleVisibility" class="zoom-btn hide-btn" title="Hide Controls">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2"/>
        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2"/>
      </svg>
    </button>
  </div>
  
  <button 
    v-else 
    @click="toggleVisibility" 
    class="show-zoom-btn" 
    title="Show Zoom Controls"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2"/>
      <path d="M11 8V14" stroke="currentColor" stroke-width="2"/>
      <path d="M8 11H14" stroke="currentColor" stroke-width="2"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  zoom: number
}

defineProps<Props>()
defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'reset-zoom': []
}>()

const visible = ref(true)

const toggleVisibility = () => {
  visible.value = !visible.value
}
</script>

<style scoped>
.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  backdrop-filter: blur(8px);
}

@media (max-width: 768px) {
  .zoom-controls {
    bottom: 10px;
    right: 10px;
    gap: 2px;
    padding: 2px;
  }
}

.zoom-btn {
  background: transparent;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #64748b;
}

@media (max-width: 768px) {
  .zoom-btn {
    width: 28px;
    height: 28px;
  }
}

.zoom-btn:hover {
  background: #f1f5f9;
  color: #475569;
  transform: translateY(-1px);
}

.hide-btn {
  color: #ef4444;
}

.hide-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.zoom-level {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  min-width: 40px;
  text-align: center;
  padding: 0 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.show-zoom-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  transition: all 0.15s ease;
  color: #64748b;
}

@media (max-width: 768px) {
  .show-zoom-btn {
    bottom: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
  }
}

.show-zoom-btn:hover {
  background: #f8fafc;
  color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
</style>