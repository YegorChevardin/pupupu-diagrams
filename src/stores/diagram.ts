import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Shape {
  id: string
  type: 'rectangle' | 'diamond' | 'text'
  x: number
  y: number
  width: number
  height: number
  text?: string
  fontSize?: number
  selected?: boolean
  fill?: string
  stroke?: string
  strokeWidth?: number
  createdAt?: number
}

export interface Arrow {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  selected?: boolean
  stroke?: string
  strokeWidth?: number
  createdAt?: number
}

export const useDiagramStore = defineStore('diagram', () => {
  const shapes = ref<Shape[]>([])
  const arrows = ref<Arrow[]>([])
  const selectedShape = ref<Shape | null>(null)
  const selectedArrow = ref<Arrow | null>(null)
  const tool = ref<string>('select')
  
  const setTool = (newTool: string) => {
    tool.value = newTool
    clearSelection()
  }
  
  const addShape = (shapeData: Omit<Shape, 'id' | 'selected' | 'createdAt'>) => {
    const shape: Shape = {
      ...shapeData,
      id: generateId(),
      selected: false,
      createdAt: Date.now()
    }
    shapes.value.push(shape)
    saveToLocalStorage()
  }
  
  const addArrow = (arrowData: Omit<Arrow, 'id' | 'selected' | 'createdAt'>) => {
    const arrow: Arrow = {
      ...arrowData,
      id: generateId(),
      selected: false,
      createdAt: Date.now()
    }
    arrows.value.push(arrow)
    saveToLocalStorage()
  }
  
  const selectShape = (shape: Shape) => {
    clearSelection()
    selectedShape.value = shape
    shape.selected = true
  }
  
  const selectArrow = (arrow: Arrow) => {
    clearSelection()
    selectedArrow.value = arrow
    arrow.selected = true
  }
  
  const clearSelection = () => {
    if (selectedShape.value) {
      selectedShape.value.selected = false
      selectedShape.value = null
    }
    if (selectedArrow.value) {
      selectedArrow.value.selected = false
      selectedArrow.value = null
    }
  }
  
  const moveShape = (shapeId: string, deltaX: number, deltaY: number) => {
    const shape = shapes.value.find(s => s.id === shapeId)
    if (shape) {
      shape.x += deltaX
      shape.y += deltaY
      saveToLocalStorage()
    }
  }
  
  const deleteSelected = () => {
    let shouldSave = false
    if (selectedShape.value) {
      const index = shapes.value.findIndex(s => s.id === selectedShape.value!.id)
      if (index > -1) {
        shapes.value.splice(index, 1)
        selectedShape.value = null
        shouldSave = true
      }
    }
    if (selectedArrow.value) {
      const index = arrows.value.findIndex(a => a.id === selectedArrow.value!.id)
      if (index > -1) {
        arrows.value.splice(index, 1)
        selectedArrow.value = null
        shouldSave = true
      }
    }
    if (shouldSave) {
      saveToLocalStorage()
    }
  }
  
  const clearCanvas = () => {
    shapes.value = []
    arrows.value = []
    selectedShape.value = null
    selectedArrow.value = null
    saveToLocalStorage()
  }
  
  const loadDiagram = (data: { shapes: Shape[], arrows: Arrow[] }) => {
    shapes.value = data.shapes || []
    arrows.value = data.arrows || []
    selectedShape.value = null
    selectedArrow.value = null
    saveToLocalStorage()
  }
  
  const updateShapeText = (shapeId: string, text: string) => {
    const shape = shapes.value.find(s => s.id === shapeId)
    if (shape) {
      shape.text = text
      saveToLocalStorage()
    }
  }
  
  const updateShapeFontSize = (shapeId: string, fontSize: number) => {
    const shape = shapes.value.find(s => s.id === shapeId)
    if (shape) {
      shape.fontSize = fontSize
      saveToLocalStorage()
    }
  }
  
  const saveToLocalStorage = () => {
    const data = {
      shapes: shapes.value,
      arrows: arrows.value,
      timestamp: Date.now()
    }
    localStorage.setItem('easy-uml-diagram', JSON.stringify(data))
  }
  
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('easy-uml-diagram')
      if (saved) {
        const data = JSON.parse(saved)
        shapes.value = data.shapes || []
        arrows.value = data.arrows || []
        selectedShape.value = null
        selectedArrow.value = null
      }
    } catch (error) {
      console.warn('Failed to load diagram from localStorage:', error)
    }
  }
  
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
  }
  
  // Load from localStorage on store initialization
  loadFromLocalStorage()
  
  return {
    shapes,
    arrows,
    selectedShape,
    selectedArrow,
    tool,
    setTool,
    addShape,
    addArrow,
    selectShape,
    selectArrow,
    clearSelection,
    moveShape,
    deleteSelected,
    clearCanvas,
    loadDiagram,
    updateShapeText,
    saveToLocalStorage,
    loadFromLocalStorage,
    updateShapeFontSize
  }
})