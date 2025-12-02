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
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  z-index: 10;
  transition: all 0.3s ease;
}

:global(.dark) .zoom-controls {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .zoom-controls {
    bottom: 16px;
    right: 16px;
    gap: 2px;
    padding: 3px;
  }
}

.zoom-btn {
  background: transparent;
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
}

:global(.dark) .zoom-btn {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .zoom-btn {
    width: 30px;
    height: 30px;
  }
}

.zoom-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: scale(1.08);
}

:global(.dark) .zoom-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.zoom-btn:active {
  transform: scale(0.95);
}

.hide-btn {
  color: #94a3b8;
}

.hide-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

:global(.dark) .hide-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.zoom-level {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  min-width: 42px;
  text-align: center;
  padding: 0 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
  letter-spacing: -0.5px;
  transition: color 0.3s ease;
}

:global(.dark) .zoom-level {
  color: #cbd5e1;
}

.show-zoom-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
}

:global(.dark) .show-zoom-btn {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .show-zoom-btn {
    bottom: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
  }
}

.show-zoom-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15);
}

:global(.dark) .show-zoom-btn:hover {
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4);
}

.show-zoom-btn:active {
  transform: translateY(0) scale(1);
}
</style>