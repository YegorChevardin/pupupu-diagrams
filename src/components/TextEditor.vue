<template>
  <g v-if="visible">
    <!-- Text input -->
    <foreignObject
      :x="position.x - width/2"
      :y="position.y - height/2"
      :width="width"
      :height="height"
    >
      <input
        ref="inputElement"
        v-model="localText"
        type="text"
        class="text-editor-input"
        :style="{ fontSize: fontSize + 'px' }"
        @blur="$emit('finish')"
        @keydown.enter="$emit('finish')"
        @keydown.escape="$emit('cancel')"
        @keydown="handleKeydown"
      />
    </foreignObject>
    
    <!-- Font size controls -->
    <g :transform="`translate(${position.x + width/2 + 10}, ${position.y - height/2})`">
      <rect x="0" y="0" width="80" height="35" fill="white" stroke="#ddd" rx="4" stroke-width="1"/>
      <text x="5" y="12" font-size="9" fill="#666">Font Size</text>
      
      <!-- Decrease button -->
      <circle cx="15" cy="23" r="6" fill="#f8f9fa" stroke="#dee2e6" class="font-btn" @click="decreaseSize"/>
      <text x="15" y="26" font-size="8" text-anchor="middle" fill="#495057">−</text>
      
      <!-- Size display -->
      <text x="40" y="26" font-size="10" text-anchor="middle" fill="#495057">{{ fontSize }}</text>
      
      <!-- Increase button -->
      <circle cx="65" cy="23" r="6" fill="#f8f9fa" stroke="#dee2e6" class="font-btn" @click="increaseSize"/>
      <text x="65" y="26" font-size="8" text-anchor="middle" fill="#495057">+</text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

interface Props {
  visible: boolean
  position: { x: number; y: number }
  text: string
  fontSize: number
  zoom: number
}

interface Emits {
  (e: 'finish'): void
  (e: 'cancel'): void
  (e: 'update:text', text: string): void
  (e: 'update:fontSize', size: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputElement = ref<HTMLInputElement>()
const localText = ref('')
const width = 120
const height = 24

// Sync local text with prop
watch(() => props.text, (newText) => {
  localText.value = newText
}, { immediate: true })

watch(localText, (newText) => {
  emit('update:text', newText)
})

// Focus input when becoming visible
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      if (inputElement.value) {
        inputElement.value.focus()
        inputElement.value.select()
      }
    })
  }
})

const handleKeydown = (event: KeyboardEvent) => {
  // Prevent canvas shortcuts during text editing
  event.stopPropagation()
}

const decreaseSize = () => {
  const newSize = Math.max(8, props.fontSize - 2)
  emit('update:fontSize', newSize)
}

const increaseSize = () => {
  const newSize = Math.min(72, props.fontSize + 2)
  emit('update:fontSize', newSize)
}
</script>

<style scoped>
.text-editor-input {
  width: 100%;
  height: 100%;
  border: 2px solid #667eea;
  border-radius: 6px;
  padding: 6px 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  outline: none;
  background: rgba(255, 255, 255, 0.98);
  text-align: center;
  box-sizing: border-box;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

:global(.dark) .text-editor-input {
  background: rgba(30, 41, 59, 0.98);
  border-color: #818cf8;
  color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(129, 140, 248, 0.3);
}

.text-editor-input:focus {
  border-color: #764ba2;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3), 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:global(.dark) .text-editor-input:focus {
  border-color: #a78bfa;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4), 0 0 0 3px rgba(129, 140, 248, 0.2);
}

.font-btn {
  cursor: pointer;
  transition: all 0.2s ease;
}

.font-btn:hover {
  fill: rgba(102, 126, 234, 0.1);
  stroke: #667eea;
}

:global(.dark) .font-btn:hover {
  fill: rgba(139, 92, 246, 0.2);
  stroke: #818cf8;
}

.font-btn:active {
  fill: rgba(102, 126, 234, 0.2);
  stroke: #764ba2;
  transform: scale(0.95);
}

:global(.dark) .font-btn:active {
  fill: rgba(139, 92, 246, 0.3);
  stroke: #a78bfa;
}
</style>