<template>
  <div class="toolbar">
    <div class="tool-group">
      <button
        v-for="toolOption in tools"
        :key="toolOption.id"
        :class="['tool-btn', { active: diagramStore.tool === toolOption.id }]"
        @click="setTool(toolOption.id)"
        :title="toolOption.name"
      >
        {{ toolOption.icon }}
      </button>
    </div>
    
    <div class="tool-group">
      <button class="tool-btn" @click="clearCanvas" title="Clear All">
        🗑️
      </button>
      <button class="tool-btn" @click="saveToFile" title="Export to File">
        💾
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="loadFromFile"
      />
      <button class="tool-btn" @click="openFile" title="Import from File">
        📁
      </button>
      <span class="auto-save-indicator" title="Auto-saved to browser storage">
        ✓ Auto-saved
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDiagramStore } from '../stores/diagram.js'

const diagramStore = useDiagramStore()

const fileInput = ref<HTMLInputElement>()

const tools = [
  { id: 'select', name: 'Select', icon: '👆' },
  { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
  { id: 'diamond', name: 'Diamond', icon: '🔸' },
  { id: 'text', name: 'Text', icon: 'T' },
  { id: 'arrow', name: 'Arrow', icon: '➡️' }
]

const setTool = (toolId: string) => {
  diagramStore.setTool(toolId)
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
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      diagramStore.loadDiagram(data)
    } catch (error) {
      alert('Error loading file: Invalid format')
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tool-group {
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.tool-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tool-btn.active {
  background: #3498db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.auto-save-indicator {
  font-size: 0.75rem;
  color: #28a745;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}
</style>