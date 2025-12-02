<template>
  <div
    v-if="visible"
    class="properties-panel"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
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
      
      <!-- Sticker Properties -->
      <div v-if="elementType === 'sticker'" class="property-group">
        <label class="property-label">Sticker Color</label>
        <div class="color-options">
          <div
            v-for="color in stickerColors"
            :key="color.name"
            class="color-option"
            :class="{ active: stickerColor === color.name }"
            :style="{ backgroundColor: color.value }"
            @click="$emit('update:stickerColor', color.name)"
          >
            <span class="color-label">{{ color.label }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="elementType === 'sticker'" class="property-group">
        <label class="property-label">Emoji</label>
        <div class="emoji-options">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            class="emoji-option"
            :class="{ active: selectedEmoji === emoji }"
            @click="$emit('update:emoji', emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
      
      <!-- Rotation Controls (for all elements) -->
      <div v-if="elementType !== null" class="property-group">
        <label class="property-label">Rotation</label>
        <div class="rotation-controls">
          <input 
            type="number" 
            :value="rotation || 0" 
            @input="$emit('update:rotation', parseFloat(($event.target as HTMLInputElement).value))"
            class="rotation-input"
            :class="{ disabled: rotationDisabled }"
            min="0"
            max="359"
            step="1"
            :disabled="rotationDisabled"
            :title="rotationDisabled ? 'Cannot rotate connected arrows' : 'Rotation (degrees)'"
          />
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
  elementType: 'text' | 'shape' | 'arrow' | 'drawingPath' | 'sticker' | null
  showTextControls?: boolean
  showShapeControls?: boolean
  fontSize?: number
  selectedFill?: string
  selectedStroke?: string
  strokeWidth?: number
  rotation?: number
  rotationDisabled?: boolean
  stickerColor?: string
  selectedEmoji?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'update:fontSize', fontSize: number): void
  (e: 'update:fill', color: string): void
  (e: 'update:stroke', color: string): void
  (e: 'update:strokeWidth', width: number): void
  (e: 'update:rotation', rotation: number): void
  (e: 'update:stickerColor', color: string): void
  (e: 'update:emoji', emoji: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showTextControls: false,
  showShapeControls: false,
  fontSize: 14,
  selectedFill: 'white',
  selectedStroke: '#000000',
  strokeWidth: 1,
  rotation: 0,
  rotationDisabled: false
})

const emit = defineEmits<Emits>()

const title = computed(() => {
  switch (props.elementType) {
    case 'text': return 'Text Properties'
    case 'shape': return 'Shape Properties'
    case 'arrow': return 'Arrow Properties'
    case 'sticker': return 'Sticker Properties'
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

const stickerColors = [
  { name: 'yellow', value: '#fef08a', label: 'Y' },
  { name: 'red', value: '#fca5a5', label: 'R' },
  { name: 'blue', value: '#93c5fd', label: 'B' },
  { name: 'green', value: '#86efac', label: 'G' }
]

const emojis = ['📌', '⭐', '💡', '🎯', '✅', '❗', '💭', '🔥', '👍', '📝', '🎨', '🚀']

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
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);
  min-width: 200px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.3s ease;
}

:global(.dark) .properties-panel {
  background: rgba(30, 41, 59, 0.98);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(248, 249, 250, 0.6);
  border-radius: 12px 12px 0 0;
  transition: all 0.3s ease;
}

:global(.dark) .panel-header {
  background: rgba(15, 23, 42, 0.6);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  transition: color 0.3s ease;
}

:global(.dark) .panel-title {
  color: #e2e8f0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:global(.dark) .close-btn {
  color: #94a3b8;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #333;
}

:global(.dark) .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.panel-content {
  padding: 14px;
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
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

:global(.dark) .property-label {
  color: #94a3b8;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-btn {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
}

:global(.dark) .size-btn {
  background: #334155;
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.size-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(1.05);
}

:global(.dark) .size-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  color: #a78bfa;
}

.font-size-display {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: center;
  transition: color 0.3s ease;
}

:global(.dark) .font-size-display {
  color: #cbd5e1;
}

.color-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.color-picker {
  width: 42px;
  height: 32px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  background: none;
  transition: all 0.2s ease;
}

:global(.dark) .color-picker {
  border-color: rgba(255, 255, 255, 0.15);
}

.color-picker:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.color-option {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.color-option.active {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  transform: scale(1.1);
}

:global(.dark) .color-option.active {
  border-color: #818cf8;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.4);
}

.line-options {
  display: flex;
  gap: 4px;
}

.line-option {
  padding: 7px 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
}

:global(.dark) .line-option {
  background: #334155;
  border-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.line-option:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
}

:global(.dark) .line-option:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  color: #a78bfa;
}

.line-option.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

:global(.dark) .line-option.active {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
}

.rotation-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}

.rotation-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  font-weight: 600;
  background: white;
  transition: all 0.2s ease;
}

:global(.dark) .rotation-input {
  background: #334155;
  border-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.rotation-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:global(.dark) .rotation-input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
}

.rotation-input:disabled,
.rotation-input.disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.5;
}

:global(.dark) .rotation-input:disabled,
:global(.dark) .rotation-input.disabled {
  background-color: #1e293b;
  color: #64748b;
}

.color-label {
  font-size: 10px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

:global(.dark) .color-label {
  color: rgba(255, 255, 255, 0.8);
}

.emoji-options {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.emoji-option {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  padding: 0;
}

:global(.dark) .emoji-option {
  background: rgba(255, 255, 255, 0.05);
}

.emoji-option:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  transform: scale(1.1);
}

:global(.dark) .emoji-option:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
}

.emoji-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  transform: scale(1.05);
}

:global(.dark) .emoji-option.active {
  border-color: #818cf8;
  background: rgba(129, 140, 248, 0.2);
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.4);
}
</style>