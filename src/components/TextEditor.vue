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
  border: 2px solid #007bff;
  border-radius: 4px;
  padding: 4px 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  outline: none;
  background: white;
  text-align: center;
  box-sizing: border-box;
}

.text-editor-input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.font-btn {
  cursor: pointer;
  transition: all 0.15s ease;
}

.font-btn:hover {
  fill: #e9ecef;
  stroke: #adb5bd;
}

.font-btn:active {
  fill: #dee2e6;
  stroke: #6c757d;
}
</style>