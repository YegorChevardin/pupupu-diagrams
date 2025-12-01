<template>
  <div
    v-if="visible"
    class="properties-panel"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <div class="panel-pointer"></div>
    <div class="panel-header">
      <span class="panel-title">{{ title }}</span>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <div class="panel-content">
      <!-- Text Properties -->
      <div v-if="showTextControls" class="property-group">
        <label class="property-label">Font Size</label>
        <div class="font-size-controls">
          <button @click="decreaseFontSize" class="size-btn">-</button>
          <span class="font-size-display">{{ fontSize }}px</span>
          <button @click="increaseFontSize" class="size-btn">+</button>
        </div>
      </div>
      
      <!-- Shape Properties -->
      <div v-if="showShapeControls" class="property-group">
        <label class="property-label">Fill Color</label>
        <div class="color-options">
          <div
            v-for="color in fillColors"
            :key="color"
            class="color-option"
            :class="{ active: selectedFill === color }"
            :style="{ backgroundColor: color }"
            @click="$emit('update:fill', color)"
          ></div>
        </div>
      </div>
      
      <!-- Rotation Controls (for all elements) -->
      <div v-if="elementType !== null" class="property-group">
        <label class="property-label">Rotation</label>
        <div class="rotation-controls">
          <button 
            class="rotation-btn"
            @click="$emit('rotate', -15)"
            title="Rotate Left 15°"
          >
            ↺ 15°
          </button>
          <button 
            class="rotation-btn"
            @click="$emit('rotate', -45)"
            title="Rotate Left 45°"
          >
            ↺ 45°
          </button>
          <input 
            type="number" 
            :value="rotation || 0" 
            @input="$emit('update:rotation', parseFloat(($event.target as HTMLInputElement).value))"
            class="rotation-input"
            min="0"
            max="359"
            step="1"
            title="Rotation (degrees)"
          />
          <button 
            class="rotation-btn"
            @click="$emit('rotate', 45)"
            title="Rotate Right 45°"
          >
            ↻ 45°
          </button>
          <button 
            class="rotation-btn"
            @click="$emit('rotate', 15)"
            title="Rotate Right 15°"
          >
            ↻ 15°
          </button>
        </div>
      </div>
      
      <!-- Drawing Path Properties -->
      <div v-if="elementType === 'drawingPath'" class="property-group">
        <label class="property-label">Drawing Color</label>
        <div class="color-options">
          <input 
            type="color" 
            :value="selectedStroke" 
            @input="$emit('update:stroke', ($event.target as HTMLInputElement).value)"
            class="color-picker"
          />
        </div>
        
        <label class="property-label">Line Style</label>
        <div class="line-options">
          <button 
            class="line-option"
            :class="{ active: strokeWidth === 1 }"
            @click="$emit('update:strokeWidth', 1)"
          >
            Thin
          </button>
          <button 
            class="line-option"
            :class="{ active: strokeWidth === 2 }"
            @click="$emit('update:strokeWidth', 2)"
          >
            Medium
          </button>
          <button 
            class="line-option"
            :class="{ active: strokeWidth === 4 }"
            @click="$emit('update:strokeWidth', 4)"
          >
            Thick
          </button>
        </div>
      </div>
      
      <!-- Arrow Properties -->
      <div v-if="elementType === 'arrow'" class="property-group">
        <label class="property-label">Line Style</label>
        <div class="line-options">
          <button 
            class="line-option"
            :class="{ active: strokeWidth === 1 }"
            @click="$emit('update:strokeWidth', 1)"
          >
            Thin
          </button>
          <button 
            class="line-option"
            :class="{ active: strokeWidth === 2 }"
            @click="$emit('update:strokeWidth', 2)"
          >
            Medium
          </button>
          <button 
            class="line-option"
            :class="{ active: strokeWidth === 3 }"
            @click="$emit('update:strokeWidth', 3)"
          >
            Thick
          </button>
        </div>
        
        <label class="property-label">Arrow Color</label>
        <div class="color-options">
          <div
            v-for="color in arrowColors"
            :key="color"
            class="color-option"
            :class="{ active: selectedStroke === color }"
            :style="{ backgroundColor: color }"
            @click="$emit('update:stroke', color)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  position: { x: number; y: number }
  elementType: 'text' | 'shape' | 'arrow' | 'drawingPath' | null
  showTextControls?: boolean
  showShapeControls?: boolean
  fontSize?: number
  selectedFill?: string
  selectedStroke?: string
  strokeWidth?: number
  rotation?: number
}

interface Emits {
  (e: 'close'): void
  (e: 'update:fontSize', fontSize: number): void
  (e: 'update:fill', color: string): void
  (e: 'update:stroke', color: string): void
  (e: 'update:strokeWidth', width: number): void
  (e: 'update:rotation', rotation: number): void
  (e: 'rotate', angle: number): void
}

const props = withDefaults(defineProps<Props>(), {
  showTextControls: false,
  showShapeControls: false,
  fontSize: 14,
  selectedFill: 'white',
  selectedStroke: '#000000',
  strokeWidth: 1,
  rotation: 0
})

const emit = defineEmits<Emits>()

const title = computed(() => {
  switch (props.elementType) {
    case 'text': return 'Text Properties'
    case 'shape': return 'Shape Properties'
    case 'arrow': return 'Arrow Properties'
    default: return 'Properties'
  }
})

const fillColors = [
  'white',
  '#f8f9fa',
  '#e3f2fd',
  '#fff3e0',
  '#e8f5e8',
  '#fce4ec',
  '#f3e5f5'
]

const arrowColors = [
  '#000000',
  '#ff6b6b',
  '#4ecdc4', 
  '#45b7d1',
  '#96ceb4',
  '#feca57',
  '#ff9ff3',
  '#54a0ff'
]

const increaseFontSize = () => {
  const newSize = Math.min(72, props.fontSize + 2)
  emit('update:fontSize', newSize)
}

const decreaseFontSize = () => {
  const newSize = Math.max(8, props.fontSize - 2)
  emit('update:fontSize', newSize)
}
</script>

<style scoped>
.properties-panel {
  position: absolute;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.panel-pointer {
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
  z-index: 1001;
}

.panel-pointer::before {
  content: '';
  position: absolute;
  bottom: 1px;
  left: -9px;
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 9px solid #e0e0e0;
  z-index: -1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.panel-title {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #e0e0e0;
}

.panel-content {
  padding: 12px;
}

.property-group {
  margin-bottom: 16px;
}

.property-group:last-child {
  margin-bottom: 0;
}

.property-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.size-btn:hover {
  background: #f5f5f5;
  border-color: #bbb;
}

.font-size-display {
  font-size: 12px;
  color: #333;
  min-width: 35px;
  text-align: center;
}

.color-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.color-picker {
  width: 40px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #0078d4;
  box-shadow: 0 0 0 1px #0078d4;
}

.line-options {
  display: flex;
  gap: 4px;
}

.line-option {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
}

.line-option:hover {
  background: #f5f5f5;
}

.line-option.active {
  background: #0078d4;
  color: white;
  border-color: #0078d4;
}

.rotation-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}

.rotation-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  min-width: 35px;
}

.rotation-btn:hover {
  background: #f5f5f5;
}

.rotation-input {
  width: 50px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
}
</style>