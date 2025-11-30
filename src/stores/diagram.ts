import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Tool = 'select' | 'rectangle' | 'diamond' | 'text' | 'arrow'

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
  startShapeId?: string
  endShapeId?: string
  isCurved?: boolean
  controlPoints?: Array<{ x: number, y: number, id: string }>
}

export const useDiagramStore = defineStore('diagram', () => {
  const shapes = ref<Shape[]>([])
  const arrows = ref<Arrow[]>([])
  const selectedShape = ref<Shape | null>(null)
  const selectedArrow = ref<Arrow | null>(null)
  const tool = ref<Tool>('select')
  
  // Connection state for dot-to-dot arrow creation
  const connectionState = ref<{
    isConnecting: boolean
    startPoint: { x: number, y: number, shapeId: string, dotId: string } | null
  }>({ isConnecting: false, startPoint: null })
  
  const setTool = (newTool: Tool) => {
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
  
  const findShapeAt = (x: number, y: number, threshold: number = 20): Shape | null => {
    return shapes.value.find(shape => {
      if (shape.type === 'text') {
        const textWidth = (shape.text?.length || 20) * (shape.fontSize ?? 14) * 0.6
        const textHeight = shape.fontSize ?? 14
        return x >= shape.x - threshold && 
               x <= shape.x + textWidth + threshold && 
               y >= shape.y - textHeight - threshold && 
               y <= shape.y + threshold
      } else {
        return x >= shape.x - threshold && 
               x <= shape.x + shape.width + threshold && 
               y >= shape.y - threshold && 
               y <= shape.y + shape.height + threshold
      }
    }) || null
  }

  const getShapeConnectionPoints = (shape: Shape): Array<{ x: number, y: number, id: string }> => {
    const points: Array<{ x: number, y: number, id: string }> = []
    
    if (shape.type === 'text') {
      const textWidth = (shape.text?.length || 20) * (shape.fontSize ?? 14) * 0.6
      const textHeight = shape.fontSize ?? 14
      const left = shape.x
      const right = shape.x + textWidth
      const top = shape.y - textHeight
      const bottom = shape.y
      const centerX = shape.x + textWidth / 2
      const centerY = shape.y - textHeight / 2
      
      // 8 connection points: 4 corners + 4 sides
      points.push(
        { x: left, y: top, id: 'top-left' },
        { x: centerX, y: top, id: 'top-center' },
        { x: right, y: top, id: 'top-right' },
        { x: right, y: centerY, id: 'right-center' },
        { x: right, y: bottom, id: 'bottom-right' },
        { x: centerX, y: bottom, id: 'bottom-center' },
        { x: left, y: bottom, id: 'bottom-left' },
        { x: left, y: centerY, id: 'left-center' }
      )
    } else {
      const left = shape.x
      const right = shape.x + shape.width
      const top = shape.y
      const bottom = shape.y + shape.height
      const centerX = shape.x + shape.width / 2
      const centerY = shape.y + shape.height / 2
      
      // 8 connection points: 4 corners + 4 sides
      points.push(
        { x: left, y: top, id: 'top-left' },
        { x: centerX, y: top, id: 'top-center' },
        { x: right, y: top, id: 'top-right' },
        { x: right, y: centerY, id: 'right-center' },
        { x: right, y: bottom, id: 'bottom-right' },
        { x: centerX, y: bottom, id: 'bottom-center' },
        { x: left, y: bottom, id: 'bottom-left' },
        { x: left, y: centerY, id: 'left-center' }
      )
    }
    
    return points
  }

  const getClosestConnectionPoint = (shape: Shape, targetX: number, targetY: number): { x: number, y: number, id: string } => {
    const points = getShapeConnectionPoints(shape)
    if (points.length === 0) {
      // Fallback to shape center if no points
      return { x: shape.x + (shape.width || 0) / 2, y: shape.y + (shape.height || 0) / 2, id: 'center' }
    }
    
    let closestPoint = points[0]!
    let minDistance = Math.sqrt(Math.pow(points[0]!.x - targetX, 2) + Math.pow(points[0]!.y - targetY, 2))
    
    for (const point of points) {
      const distance = Math.sqrt(Math.pow(point.x - targetX, 2) + Math.pow(point.y - targetY, 2))
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = point
      }
    }
    
    return closestPoint
  }

  const addArrow = (arrowData: Omit<Arrow, 'id' | 'selected' | 'createdAt'>) => {
    let finalArrowData = { ...arrowData }
    
    // Check if start point is near a shape
    const startShape = findShapeAt(arrowData.startX, arrowData.startY)
    if (startShape) {
      const connectionPoint = getClosestConnectionPoint(startShape, arrowData.startX, arrowData.startY)
      finalArrowData.startX = connectionPoint.x
      finalArrowData.startY = connectionPoint.y
      finalArrowData.startShapeId = startShape.id
    }
    
    // Check if end point is near a shape
    const endShape = findShapeAt(arrowData.endX, arrowData.endY)
    if (endShape) {
      const connectionPoint = getClosestConnectionPoint(endShape, arrowData.endX, arrowData.endY)
      finalArrowData.endX = connectionPoint.x
      finalArrowData.endY = connectionPoint.y
      finalArrowData.endShapeId = endShape.id
    }

    const arrow: Arrow = {
      ...finalArrowData,
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
  
  const updateConnectedArrows = (shapeId: string) => {
    const shape = shapes.value.find(s => s.id === shapeId)
    if (!shape) return
    
    arrows.value.forEach(arrow => {
      if (arrow.startShapeId === shapeId) {
        const connectionPoint = getClosestConnectionPoint(shape, arrow.endX, arrow.endY)
        arrow.startX = connectionPoint.x
        arrow.startY = connectionPoint.y
      }
      if (arrow.endShapeId === shapeId) {
        const connectionPoint = getClosestConnectionPoint(shape, arrow.startX, arrow.startY)
        arrow.endX = connectionPoint.x
        arrow.endY = connectionPoint.y
      }
    })
  }

  const moveShape = (shapeId: string, deltaX: number, deltaY: number) => {
    const shape = shapes.value.find(s => s.id === shapeId)
    if (shape) {
      shape.x += deltaX
      shape.y += deltaY
      updateConnectedArrows(shapeId)
      saveToLocalStorage()
    }
  }
  
  const deleteShape = (shapeId: string) => {
    const index = shapes.value.findIndex(s => s.id === shapeId)
    if (index > -1) {
      shapes.value.splice(index, 1)
      // Remove arrows connected to this shape
      arrows.value = arrows.value.filter(arrow => 
        arrow.startShapeId !== shapeId && arrow.endShapeId !== shapeId
      )
      if (selectedShape.value?.id === shapeId) {
        selectedShape.value = null
      }
      saveToLocalStorage()
    }
  }

  const deleteArrow = (arrowId: string) => {
    const index = arrows.value.findIndex(a => a.id === arrowId)
    if (index > -1) {
      arrows.value.splice(index, 1)
      if (selectedArrow.value?.id === arrowId) {
        selectedArrow.value = null
      }
      saveToLocalStorage()
    }
  }

  const deleteSelected = () => {
    let shouldSave = false
    if (selectedShape.value) {
      deleteShape(selectedShape.value.id)
      shouldSave = true
    }
    if (selectedArrow.value) {
      deleteArrow(selectedArrow.value.id)
      shouldSave = true
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
  
  const startConnection = (point: { x: number, y: number }, shapeId: string, dotId: string) => {
    connectionState.value.isConnecting = true
    connectionState.value.startPoint = { x: point.x, y: point.y, shapeId, dotId }
  }

  const completeConnection = (endPoint: { x: number, y: number }, endShapeId: string, endDotId: string) => {
    if (!connectionState.value.startPoint) return

    const startPoint = connectionState.value.startPoint
    
    // Don't create arrow if connecting to the same shape
    if (startPoint.shapeId === endShapeId) {
      cancelConnection()
      return
    }

    // Create arrow between the two connection points
    const arrowData = {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: endPoint.x,
      endY: endPoint.y,
      startShapeId: startPoint.shapeId,
      endShapeId: endShapeId
    }

    addArrow(arrowData)
    cancelConnection()
  }

  const cancelConnection = () => {
    connectionState.value.isConnecting = false
    connectionState.value.startPoint = null
  }

  const convertArrowToCurved = (arrowId: string) => {
    const arrow = arrows.value.find(a => a.id === arrowId)
    if (!arrow) return

    if (!arrow.isCurved) {
      // Add initial control point in the middle
      const midX = (arrow.startX + arrow.endX) / 2
      const midY = (arrow.startY + arrow.endY) / 2
      
      arrow.isCurved = true
      arrow.controlPoints = [{
        x: midX,
        y: midY,
        id: generateId()
      }]
      saveToLocalStorage()
    }
  }

  const addControlPoint = (arrowId: string, afterIndex?: number) => {
    const arrow = arrows.value.find(a => a.id === arrowId)
    if (!arrow || !arrow.isCurved || !arrow.controlPoints || arrow.controlPoints.length === 0) return

    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : arrow.controlPoints.length
    
    // Calculate position for new control point
    let newX, newY
    
    if (insertIndex === 0 && arrow.controlPoints[0]) {
      // Insert before first control point
      newX = (arrow.startX + arrow.controlPoints[0].x) / 2
      newY = (arrow.startY + arrow.controlPoints[0].y) / 2
    } else if (insertIndex >= arrow.controlPoints.length) {
      // Insert after last control point
      const lastPoint = arrow.controlPoints[arrow.controlPoints.length - 1]
      if (lastPoint) {
        newX = (lastPoint.x + arrow.endX) / 2
        newY = (lastPoint.y + arrow.endY) / 2
      } else {
        return
      }
    } else {
      // Insert between two control points
      const prevPoint = arrow.controlPoints[insertIndex - 1]
      const nextPoint = arrow.controlPoints[insertIndex]
      if (prevPoint && nextPoint) {
        newX = (prevPoint.x + nextPoint.x) / 2
        newY = (prevPoint.y + nextPoint.y) / 2
      } else {
        return
      }
    }

    arrow.controlPoints.splice(insertIndex, 0, {
      x: newX,
      y: newY,
      id: generateId()
    })
    
    saveToLocalStorage()
  }

  const updateControlPoint = (arrowId: string, controlPointId: string, x: number, y: number) => {
    const arrow = arrows.value.find(a => a.id === arrowId)
    if (!arrow || !arrow.controlPoints) return

    const controlPoint = arrow.controlPoints.find(cp => cp.id === controlPointId)
    if (controlPoint) {
      controlPoint.x = x
      controlPoint.y = y
      saveToLocalStorage()
    }
  }

  const removeControlPoint = (arrowId: string, controlPointId: string) => {
    const arrow = arrows.value.find(a => a.id === arrowId)
    if (!arrow || !arrow.controlPoints) return

    const index = arrow.controlPoints.findIndex(cp => cp.id === controlPointId)
    if (index > -1) {
      arrow.controlPoints.splice(index, 1)
      
      // If no control points left, convert back to straight arrow
      if (arrow.controlPoints.length === 0) {
        arrow.isCurved = false
        arrow.controlPoints = undefined
      }
      
      saveToLocalStorage()
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
    updateConnectedArrows,
    deleteShape,
    deleteArrow,
    deleteSelected,
    clearCanvas,
    loadDiagram,
    updateShapeText,
    saveToLocalStorage,
    loadFromLocalStorage,
    updateShapeFontSize,
    getShapeConnectionPoints,
    getClosestConnectionPoint,
    connectionState,
    startConnection,
    completeConnection,
    cancelConnection,
    convertArrowToCurved,
    addControlPoint,
    updateControlPoint,
    removeControlPoint
  }
})