<template>
  <div v-if="visible" class="zoom-controls">
    <button @click="$emit('zoom-in')" class="zoom-btn" title="Zoom In">+</button>
    <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
    <button @click="$emit('zoom-out')" class="zoom-btn" title="Zoom Out">−</button>
    <button @click="$emit('reset-zoom')" class="zoom-btn" title="Reset Zoom">⌂</button>
    <button @click="toggleVisibility" class="zoom-btn hide-btn" title="Hide Controls">×</button>
  </div>
  
  <!-- Show button when hidden -->
  <button 
    v-else 
    @click="toggleVisibility" 
    class="show-zoom-btn" 
    title="Show Zoom Controls"
  >
    🔍
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
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  padding: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.zoom-btn {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
  transition: all 0.2s;
  color: #495057;
}

.zoom-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.hide-btn {
  color: #dc3545;
  margin-left: 0.125rem;
}

.hide-btn:hover {
  background: #f8d7da;
  border-color: #dc3545;
}

.zoom-level {
  font-size: 0.75rem;
  font-weight: 500;
  color: #495057;
  min-width: 2.5rem;
  text-align: center;
  padding: 0 0.25rem;
}

.show-zoom-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.show-zoom-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}
</style>