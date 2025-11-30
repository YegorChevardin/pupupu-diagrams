<template>
  <div class="toolbar">
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
import { ref, computed, h } from 'vue'
import { useDiagramStore, type Tool } from '../stores/diagram.js'

const diagramStore = useDiagramStore()

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

const DiamondIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M12 2L22 12L12 22L2 12L12 2Z', stroke: 'currentColor', 'stroke-width': 2 })
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

const tools = [
  { id: 'select', name: 'Select', icon: SelectIcon },
  { id: 'rectangle', name: 'Rectangle', icon: RectangleIcon },
  { id: 'diamond', name: 'Diamond', icon: DiamondIcon },
  { id: 'text', name: 'Text', icon: TextIcon },
  { id: 'arrow', name: 'Arrow', icon: ArrowIcon }
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
    version: '1.0'
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
      
      // Ensure shapes and arrows arrays exist
      if (!Array.isArray(data.shapes)) {
        data.shapes = []
      }
      if (!Array.isArray(data.arrows)) {
        data.arrows = []
      }
      
      diagramStore.loadDiagram(data)
      alert(`Successfully loaded ${data.shapes.length} shapes and ${data.arrows.length} arrows`)
      
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
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .toolbar {
    gap: 4px;
  }
}

.tool-group {
  display: flex;
  gap: 4px;
  background: #f7f9fc;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 4px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .tool-group {
    padding: 2px;
    gap: 2px;
  }
}

.tool-group.primary {
  background: #f7f9fc;
}

.tool-group.secondary {
  background: #ffffff;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e1e5e9;
}

.tool-btn {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  position: relative;
  min-width: 36px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .tool-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .tool-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
    padding: 4px;
  }
}

.tool-btn:hover {
  background: #e2e8f0;
  color: #475569;
  transform: translateY(-1px);
}

.tool-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.tool-btn.active:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.tool-btn svg {
  pointer-events: none;
}
</style>