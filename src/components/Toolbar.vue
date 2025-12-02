<template>
  <div class="toolbar">
    <button 
      @click="toggleTheme" 
      class="theme-toggle"
      :title="theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
    >
      <component :is="theme === 'light' ? MoonIcon : SunIcon" />
    </button>
    
    <div class="tool-group primary">
      <button
        v-for="toolOption in tools"
        :key="toolOption.id"
        :class="['tool-btn', { active: diagramStore.tool === toolOption.id }]"
        @click="setTool(toolOption.id)"
        :title="toolOption.name"
      >
        <component :is="toolOption.icon" />
      </button>
    </div>
    
    <!-- Drawing Style Controls (only show when pencil tool is selected) -->
    <template v-if="diagramStore.tool === 'pencil'">
      <div class="divider"></div>
      
      <div class="tool-group drawing-styles">
        <div class="style-control">
          <label>Color:</label>
          <input 
            type="color" 
            :value="diagramStore.currentDrawingColor" 
            @input="updateDrawingColor"
            class="color-picker"
            title="Drawing Color"
          />
        </div>
        
        <div class="style-control">
          <label>Style:</label>
          <div class="stroke-width-options">
            <button
              v-for="option in strokeWidthOptions"
              :key="option.value"
              :class="['stroke-btn', { active: diagramStore.currentDrawingStrokeWidth === option.value }]"
              @click="updateDrawingStrokeWidth(option.value)"
              :title="option.name"
            >
              <div class="stroke-preview" :style="{ height: `${option.preview}px` }"></div>
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <div class="divider"></div>
    
    <div class="tool-group secondary">
      <button class="tool-btn" @click="clearCanvas" title="Clear All">
        <TrashIcon />
      </button>
      <button class="tool-btn" @click="saveToFile" title="Export to File">
        <DownloadIcon />
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="loadFromFile"
      />
      <button class="tool-btn" @click="openFile" title="Import from File">
        <UploadIcon />
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, watch } from 'vue'
import { useDiagramStore, type Tool } from '../stores/diagram.js'
import { useTheme } from '../composables/useTheme'

const diagramStore = useDiagramStore()
const { theme, toggleTheme } = useTheme()

// Update drawing color when theme changes
watch(theme, (newTheme) => {
  const defaultColor = newTheme === 'dark' ? '#e2e8f0' : '#000000'
  diagramStore.setDrawingColor(defaultColor)
})

const fileInput = ref<HTMLInputElement>()

const SelectIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M3 7V5C3 3.89543 3.89543 3 5 3H7' }),
  h('path', { d: 'M21 7V5C21 3.89543 20.1046 3 19 3H17' }),
  h('path', { d: 'M7 21H5C3.89543 21 3 20.1046 3 19V17' }),
  h('path', { d: 'M17 21H19C20.1046 21 21 20.1046 21 19V17' })
])

const RectangleIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2, stroke: 'currentColor', 'stroke-width': 2 })
])

const CircleIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('circle', { cx: 12, cy: 12, r: 9, stroke: 'currentColor', 'stroke-width': 2 })
])

const TextIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M4 7V4H20V7', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M9 20H15', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M12 4V20', stroke: 'currentColor', 'stroke-width': 2 })
])

const ArrowIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M5 12H19', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M12 5L19 12L12 19', stroke: 'currentColor', 'stroke-width': 2 })
])

const TrashIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M3 6H5H21', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z', stroke: 'currentColor', 'stroke-width': 2 })
])

const DownloadIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M21 15V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V15', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M7 10L12 15L17 10', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M12 15V3', stroke: 'currentColor', 'stroke-width': 2 })
])

const UploadIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M21 15V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V15', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M17 8L12 3L7 8', stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M12 3V15', stroke: 'currentColor', 'stroke-width': 2 })
])

const PencilIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' })
])

const StickerIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z', fill: 'currentColor' })
])

const MoonIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
])

const SunIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('circle', { cx: 12, cy: 12, r: 5, stroke: 'currentColor', 'stroke-width': 2 }),
  h('path', { d: 'M12 1V3', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  h('path', { d: 'M12 21V23', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  h('path', { d: 'M4.22 4.22L5.64 5.64', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  h('path', { d: 'M18.36 18.36L19.78 19.78', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  h('path', { d: 'M1 12H3', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  h('path', { d: 'M21 12H23', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  h('path', { d: 'M4.22 19.78L5.64 18.36', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  h('path', { d: 'M18.36 5.64L19.78 4.22', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
])

const tools = [
  { id: 'select', name: 'Select', icon: SelectIcon },
  { id: 'rectangle', name: 'Rectangle', icon: RectangleIcon },
  { id: 'circle', name: 'Circle', icon: CircleIcon },
  { id: 'text', name: 'Text', icon: TextIcon },
  { id: 'sticker', name: 'Sticker', icon: StickerIcon },
  { id: 'arrow', name: 'Arrow', icon: ArrowIcon },
  { id: 'pencil', name: 'Pencil', icon: PencilIcon }
]

const setTool = (toolId: string) => {
  diagramStore.setTool(toolId as Tool)
}

const clearCanvas = () => {
  if (confirm('Are you sure you want to clear the canvas?')) {
    diagramStore.clearCanvas()
  }
}

const saveToFile = () => {
  const data = {
    shapes: diagramStore.shapes,
    arrows: diagramStore.arrows,
    drawingPaths: diagramStore.drawingPaths,
    version: '1.1'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `diagram-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const openFile = () => {
  fileInput.value?.click()
}

const loadFromFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.name.endsWith('.json')) {
    alert('Please select a JSON file')
    target.value = ''
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string
      if (!result) {
        throw new Error('Empty file')
      }
      
      const data = JSON.parse(result)
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure')
      }
      
      // Ensure shapes, arrows, and drawingPaths arrays exist
      if (!Array.isArray(data.shapes)) {
        data.shapes = []
      }
      if (!Array.isArray(data.arrows)) {
        data.arrows = []
      }
      if (!Array.isArray(data.drawingPaths)) {
        data.drawingPaths = []
      }
      
      diagramStore.loadDiagram(data)
      const drawingCount = data.drawingPaths?.length || 0
      alert(`Successfully loaded ${data.shapes.length} shapes, ${data.arrows.length} arrows, and ${drawingCount} drawings`)
      
    } catch (error) {
      console.error('Error loading file:', error)
      alert('Error loading file: Invalid format or corrupted data')
    } finally {
      // Clear the file input so the same file can be loaded again
      target.value = ''
    }
  }
  
  reader.onerror = () => {
    alert('Error reading file')
    target.value = ''
  }
  
  reader.readAsText(file)
}

// Drawing style controls
const strokeWidthOptions = [
  { value: 1, name: 'Thin', preview: 1 },
  { value: 2, name: 'Medium', preview: 2 },
  { value: 4, name: 'Thick', preview: 4 }
]

const updateDrawingColor = (event: Event) => {
  const target = event.target as HTMLInputElement
  diagramStore.setDrawingColor(target.value)
}

const updateDrawingStrokeWidth = (width: number) => {
  diagramStore.setDrawingStrokeWidth(width)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .toolbar {
    gap: 4px;
  }
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
}

:global(.dark) .theme-toggle {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-toggle:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
  transform: scale(1.05) rotate(15deg);
}

:global(.dark) .theme-toggle:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  color: #a78bfa;
}

.theme-toggle:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .theme-toggle {
    width: 36px;
    height: 36px;
    padding: 6px;
  }
}

.tool-group {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 3px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

:global(.dark) .tool-group {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .tool-group {
    padding: 2px;
  }
}

.tool-group.primary {
  background: rgba(255, 255, 255, 0.7);
}

:global(.dark) .tool-group.primary {
  background: rgba(30, 41, 59, 0.7);
}

.tool-group.secondary {
  background: rgba(255, 255, 255, 0.65);
}

:global(.dark) .tool-group.secondary {
  background: rgba(30, 41, 59, 0.65);
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.06);
  margin: 0 2px;
  transition: background 0.3s ease;
}

:global(.dark) .divider {
  background: rgba(255, 255, 255, 0.1);
}

.tool-btn {
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 7px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  position: relative;
  min-width: 36px;
  flex-shrink: 0;
}

:global(.dark) .tool-btn {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .tool-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }
}

@media (max-width: 480px) {
  .tool-btn {
    width: 30px;
    height: 30px;
    min-width: 30px;
  }
}

.tool-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  transform: scale(1.05);
}

:global(.dark) .tool-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.tool-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: scale(1.05);
}

:global(.dark) .tool-btn.active {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
}

.tool-btn.active:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

:global(.dark) .tool-btn.active:hover {
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.7);
}

.tool-btn svg {
  pointer-events: none;
  transition: transform 0.2s ease;
}

.tool-btn:active svg {
  transform: scale(0.95);
}

.drawing-styles {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.style-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.style-control label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

:global(.dark) .style-control label {
  color: #94a3b8;
}

.color-picker {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 7px;
  cursor: pointer;
  background: none;
  padding: 0;
  overflow: hidden;
  transition: all 0.2s ease;
}

:global(.dark) .color-picker {
  border-color: rgba(255, 255, 255, 0.1);
}

.color-picker:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

:global(.dark) .color-picker:hover {
  border-color: #8b5cf6;
}

.stroke-width-options {
  display: flex;
  gap: 2px;
}

.stroke-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 7px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

:global(.dark) .stroke-btn {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
}

.stroke-btn:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  transform: scale(1.05);
}

:global(.dark) .stroke-btn:hover {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
}

.stroke-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

:global(.dark) .stroke-btn.active {
  border-color: #818cf8;
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.stroke-preview {
  width: 20px;
  background: #64748b;
  border-radius: 2px;
  transition: all 0.2s ease;
}

:global(.dark) .stroke-preview {
  background: #94a3b8;
}

.stroke-btn.active .stroke-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:global(.dark) .stroke-btn.active .stroke-preview {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
}
</style>