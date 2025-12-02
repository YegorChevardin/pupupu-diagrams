import { defineStore } from 'pinia'
import { ref } from 'vue'
import { debounce } from '../utils/debounce'
import { rotatePoint, normalizeRotation } from '../utils/rotation'

export type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'arrow' | 'pencil'

export interface Shape {
  id: string
  type: 'rectangle' | 'circle' | 'text'
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
  rotation?: number
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
  rotation?: number
  createdAt?: number
  startShapeId?: string
  endShapeId?: string
  startDotId?: string
  endDotId?: string
  isCurved?: boolean
  controlPoints?: Array<{ x: number, y: number, id: string }>
}

export interface DrawingPath {
  id: string
  points: Array<{ x: number, y: number }>
  selected?: boolean
  stroke?: string
  strokeWidth?: number
  rotation?: number
  createdAt?: number
  // Bounding box for interaction
  minX?: number
  minY?: number
  maxX?: number
  maxY?: number
  // For connection points
  connectionPoints?: Array<{ x: number, y: number, id: string }>
}

export const useDiagramStore = defineStore('diagram', () => {
  const shapes = ref<Shape[]>([])
  const arrows = ref<Arrow[]>([])
  const drawingPaths = ref<DrawingPath[]>([])
  const selectedShape = ref<Shape | null>(null)
  const selectedArrow = ref<Arrow | null>(null)
  const selectedDrawingPath = ref<DrawingPath | null>(null)
  const tool = ref<Tool>('select')
  
  const currentDrawingColor = ref<string>('#000000')
  const currentDrawingStrokeWidth = ref<number>(2)
  
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

  const getShapeConnectionPoints = (shape: Shape): Array<{ x: number, y: number, id: string }> => {
    let points: Array<{ x: number, y: number, id: string }> = []
    let centerX: number, centerY: number
    
    if (shape.type === 'circle') {
      centerX = shape.x + shape.width / 2
      centerY = shape.y + shape.height / 2
      const radiusX = shape.width / 2
      const radiusY = shape.height / 2
      
      const angles = [
        { angle: -Math.PI / 2, id: 'top-center' },
        { angle: -Math.PI / 4, id: 'top-right' },
        { angle: 0, id: 'right-center' },
        { angle: Math.PI / 4, id: 'bottom-right' },
        { angle: Math.PI / 2, id: 'bottom-center' },
        { angle: (3 * Math.PI) / 4, id: 'bottom-left' },
        { angle: Math.PI, id: 'left-center' },
        { angle: (-3 * Math.PI) / 4, id: 'top-left' }
      ]
      
      points = angles.map(({ angle, id }) => ({
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
        id
      }))
    } else if (shape.type === 'text') {
      const textWidth = (shape.text?.length || 20) * (shape.fontSize ?? 14) * 0.6
      const textHeight = shape.fontSize ?? 14
      const left = shape.x
      const right = shape.x + textWidth
      const top = shape.y - textHeight
      const bottom = shape.y
      centerX = shape.x + textWidth / 2
      centerY = shape.y - textHeight / 2
      
      points = [
        { x: left, y: top, id: 'top-left' },
        { x: centerX, y: top, id: 'top-center' },
        { x: right, y: top, id: 'top-right' },
        { x: right, y: centerY, id: 'right-center' },
        { x: right, y: bottom, id: 'bottom-right' },
        { x: centerX, y: bottom, id: 'bottom-center' },
        { x: left, y: bottom, id: 'bottom-left' },
        { x: left, y: centerY, id: 'left-center' }
      ]
    } else {
      const left = shape.x
      const right = shape.x + shape.width
      const top = shape.y
      const bottom = shape.y + shape.height
      centerX = shape.x + shape.width / 2
      centerY = shape.y + shape.height / 2
      
      points = [
        { x: left, y: top, id: 'top-left' },
        { x: centerX, y: top, id: 'top-center' },
        { x: right, y: top, id: 'top-right' },
        { x: right, y: centerY, id: 'right-center' },
        { x: right, y: bottom, id: 'bottom-right' },
        { x: centerX, y: bottom, id: 'bottom-center' },
        { x: left, y: bottom, id: 'bottom-left' },
        { x: left, y: centerY, id: 'left-center' }
      ]
    }
    
    if (shape.rotation && shape.rotation !== 0) {
      for (const point of points) {
        const rotated = rotatePoint(point.x, point.y, centerX, centerY, shape.rotation)
        point.x = rotated.x
        point.y = rotated.y
      }
    }
    
    return points
  }

  const getDrawingPathConnectionPoints = (drawingPath: DrawingPath): Array<{ x: number, y: number, id: string }> => {
    if (!drawingPath.connectionPoints || drawingPath.connectionPoints.length === 0) {
      return []
    }
    
    const points = drawingPath.connectionPoints.map(point => ({ ...point }))
    
    if (drawingPath.rotation && drawingPath.rotation !== 0) {
      const pathCenterX = ((drawingPath.minX || 0) + (drawingPath.maxX || 0)) / 2
      const pathCenterY = ((drawingPath.minY || 0) + (drawingPath.maxY || 0)) / 2
      
      for (const point of points) {
        const rotated = rotatePoint(point.x, point.y, pathCenterX, pathCenterY, drawingPath.rotation)
        point.x = rotated.x
        point.y = rotated.y
      }
    }
    
    return points
  }

  const getConnectionPointById = (shape: Shape, dotId: string): { x: number, y: number, id: string } | null => {
    const points = getShapeConnectionPoints(shape)
    return points.find(p => p.id === dotId) || null
  }

  const getClosestConnectionPoint = (shape: Shape, targetX: number, targetY: number): { x: number, y: number, id: string } => {
    const points = getShapeConnectionPoints(shape)
    if (points.length === 0) {
      return { x: shape.x + (shape.width || 0) / 2, y: shape.y + (shape.height || 0) / 2, id: 'center' }
    }
    
    return points.reduce((closest, point) => {
      const distance = Math.sqrt(Math.pow(point.x - targetX, 2) + Math.pow(point.y - targetY, 2))
      const closestDistance = Math.sqrt(Math.pow(closest.x - targetX, 2) + Math.pow(closest.y - targetY, 2))
      return distance < closestDistance ? point : closest
    }, points[0]!)
  }

  const addArrow = (arrowData: Omit<Arrow, 'id' | 'selected' | 'createdAt'>) => {
    let finalArrowData = { ...arrowData }
    
    if (arrowData.startShapeId) {
      const startShape = shapes.value.find(s => s.id === arrowData.startShapeId)
      if (startShape) {
        if (arrowData.startDotId) {
          const connectionPoint = getConnectionPointById(startShape, arrowData.startDotId)
          if (connectionPoint) {
            finalArrowData.startX = connectionPoint.x
            finalArrowData.startY = connectionPoint.y
          }
        } else {
          const connectionPoint = getClosestConnectionPoint(startShape, arrowData.startX, arrowData.startY)
          finalArrowData.startX = connectionPoint.x
          finalArrowData.startY = connectionPoint.y
          finalArrowData.startDotId = connectionPoint.id
        }
      }
    }
    
    if (arrowData.endShapeId) {
      const endShape = shapes.value.find(s => s.id === arrowData.endShapeId)
      if (endShape) {
        if (arrowData.endDotId) {
          const connectionPoint = getConnectionPointById(endShape, arrowData.endDotId)
          if (connectionPoint) {
            finalArrowData.endX = connectionPoint.x
            finalArrowData.endY = connectionPoint.y
          }
        } else {
          const connectionPoint = getClosestConnectionPoint(endShape, arrowData.endX, arrowData.endY)
          finalArrowData.endX = connectionPoint.x
          finalArrowData.endY = connectionPoint.y
          finalArrowData.endDotId = connectionPoint.id
        }
      }
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
    if (selectedDrawingPath.value) {
      selectedDrawingPath.value.selected = false
      selectedDrawingPath.value = null
    }
  }

  const addDrawingPath = (pathData: Omit<DrawingPath, 'id' | 'selected' | 'createdAt' | 'minX' | 'minY' | 'maxX' | 'maxY' | 'connectionPoints'>) => {
    const xs = pathData.points.map(p => p.x)
    const ys = pathData.points.map(p => p.y)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    
    const drawingPath: DrawingPath = {
      ...pathData,
      id: generateId(),
      selected: false,
      createdAt: Date.now(),
      stroke: pathData.stroke || currentDrawingColor.value,
      strokeWidth: pathData.strokeWidth || currentDrawingStrokeWidth.value,
      minX,
      minY,
      maxX,
      maxY,
      connectionPoints: [
        { x: minX, y: minY, id: 'top-left' },
        { x: centerX, y: minY, id: 'top-center' },
        { x: maxX, y: minY, id: 'top-right' },
        { x: maxX, y: centerY, id: 'middle-right' },
        { x: maxX, y: maxY, id: 'bottom-right' },
        { x: centerX, y: maxY, id: 'bottom-center' },
        { x: minX, y: maxY, id: 'bottom-left' },
        { x: minX, y: centerY, id: 'middle-left' }
      ]
    }
    
    drawingPaths.value.push(drawingPath)
    saveToLocalStorage()
  }

  const selectDrawingPath = (drawingPath: DrawingPath) => {
    clearSelection()
    selectedDrawingPath.value = drawingPath
    drawingPath.selected = true
  }

  const getDrawingPathAtPoint = (x: number, y: number, threshold: number = 10): DrawingPath | null => {
    return drawingPaths.value.find(path => {
      // Check if point is within bounding box with threshold
      return x >= (path.minX || 0) - threshold && 
             x <= (path.maxX || 0) + threshold && 
             y >= (path.minY || 0) - threshold && 
             y <= (path.maxY || 0) + threshold
    }) || null
  }

  const moveDrawingPath = (pathId: string, deltaX: number, deltaY: number) => {
    const path = drawingPaths.value.find(p => p.id === pathId)
    if (!path) return
    
    path.points.forEach(point => {
      point.x += deltaX
      point.y += deltaY
    })
    
    const xs = path.points.map(p => p.x)
    const ys = path.points.map(p => p.y)
    path.minX = Math.min(...xs)
    path.minY = Math.min(...ys)
    path.maxX = Math.max(...xs)
    path.maxY = Math.max(...ys)
    
    const centerX = (path.minX + path.maxX) / 2
    const centerY = (path.minY + path.maxY) / 2
    path.connectionPoints = [
      { x: path.minX, y: path.minY, id: 'top-left' },
      { x: centerX, y: path.minY, id: 'top-center' },
      { x: path.maxX, y: path.minY, id: 'top-right' },
      { x: path.maxX, y: centerY, id: 'middle-right' },
      { x: path.maxX, y: path.maxY, id: 'bottom-right' },
      { x: centerX, y: path.maxY, id: 'bottom-center' },
      { x: path.minX, y: path.maxY, id: 'bottom-left' },
      { x: path.minX, y: centerY, id: 'middle-left' }
    ]
    
    updateConnectedArrowsForDrawingPath(pathId)
  }

  const updateConnectedArrowsForDrawingPath = (pathId: string) => {
    const path = drawingPaths.value.find(p => p.id === pathId)
    if (!path) return
    
    arrows.value.forEach(arrow => {
      if (arrow.startShapeId === pathId) {
        let connectionPoint
        if (arrow.startDotId) {
          connectionPoint = getConnectionPointByIdForPath(path, arrow.startDotId)
        }
        if (!connectionPoint) {
          connectionPoint = getClosestConnectionPointForPath(path, arrow.endX, arrow.endY)
        }
        arrow.startX = connectionPoint.x
        arrow.startY = connectionPoint.y
      }
      if (arrow.endShapeId === pathId) {
        let connectionPoint
        if (arrow.endDotId) {
          connectionPoint = getConnectionPointByIdForPath(path, arrow.endDotId)
        }
        if (!connectionPoint) {
          connectionPoint = getClosestConnectionPointForPath(path, arrow.startX, arrow.startY)
        }
        arrow.endX = connectionPoint.x
        arrow.endY = connectionPoint.y
      }
    })
  }

  const getConnectionPointByIdForPath = (path: DrawingPath, dotId: string): { x: number, y: number, id: string } | null => {
    const points = getDrawingPathConnectionPoints(path)
    return points.find(p => p.id === dotId) || null
  }

  const getClosestConnectionPointForPath = (path: DrawingPath, targetX: number, targetY: number): { x: number, y: number, id: string } => {
    if (!path.connectionPoints || path.connectionPoints.length === 0) {
      return { x: targetX, y: targetY, id: 'center' }
    }
    
    return path.connectionPoints.reduce((closest, point) => {
      const distance = Math.sqrt(Math.pow(point.x - targetX, 2) + Math.pow(point.y - targetY, 2))
      const closestDistance = Math.sqrt(Math.pow(closest.x - targetX, 2) + Math.pow(closest.y - targetY, 2))
      return distance < closestDistance ? point : closest
    }, path.connectionPoints[0]!)
  }
  
  const updateConnectedArrows = (shapeId: string) => {
    const shape = shapes.value.find(s => s.id === shapeId)
    if (!shape) return
    
    arrows.value.forEach(arrow => {
      if (arrow.startShapeId === shapeId) {
        let connectionPoint
        if (arrow.startDotId) {
          connectionPoint = getConnectionPointById(shape, arrow.startDotId)
        }
        if (!connectionPoint) {
          connectionPoint = getClosestConnectionPoint(shape, arrow.endX, arrow.endY)
        }
        arrow.startX = connectionPoint.x
        arrow.startY = connectionPoint.y
      }
      if (arrow.endShapeId === shapeId) {
        let connectionPoint
        if (arrow.endDotId) {
          connectionPoint = getConnectionPointById(shape, arrow.endDotId)
        }
        if (!connectionPoint) {
          connectionPoint = getClosestConnectionPoint(shape, arrow.startX, arrow.startY)
        }
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

  const deleteDrawingPath = (drawingPathId: string) => {
    const index = drawingPaths.value.findIndex(d => d.id === drawingPathId)
    if (index > -1) {
      drawingPaths.value.splice(index, 1)
      if (selectedDrawingPath.value?.id === drawingPathId) {
        selectedDrawingPath.value = null
      }
      saveToLocalStorage()
    }
  }

  const deleteSelected = () => {
    const hasSelections = selectedShape.value || selectedArrow.value || selectedDrawingPath.value
    
    if (selectedShape.value) {
      deleteShape(selectedShape.value.id)
    }
    if (selectedArrow.value) {
      deleteArrow(selectedArrow.value.id)
    }
    if (selectedDrawingPath.value) {
      deleteDrawingPath(selectedDrawingPath.value.id)
    }
    
    if (hasSelections) {
      saveToLocalStorage()
    }
  }
  
  const clearCanvas = () => {
    shapes.value = []
    arrows.value = []
    drawingPaths.value = []
    selectedDrawingPath.value = null
    selectedShape.value = null
    selectedArrow.value = null
    saveToLocalStorage()
  }
  
  const loadDiagram = (data: { shapes: Shape[], arrows: Arrow[], drawingPaths?: DrawingPath[] }) => {
    shapes.value = data.shapes || []
    arrows.value = data.arrows || []
    drawingPaths.value = data.drawingPaths || []
    selectedShape.value = null
    selectedArrow.value = null
    selectedDrawingPath.value = null
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
  
  const saveToLocalStorageImmediate = () => {
    const data = {
      shapes: shapes.value,
      arrows: arrows.value,
      drawingPaths: drawingPaths.value,
      timestamp: Date.now()
    }
    localStorage.setItem('easy-uml-diagram', JSON.stringify(data))
  }
  
  const saveToLocalStorage = debounce(saveToLocalStorageImmediate, 300)
  
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('easy-uml-diagram')
      if (saved) {
        const data = JSON.parse(saved)
        shapes.value = data.shapes || []
        arrows.value = data.arrows || []
        drawingPaths.value = data.drawingPaths || []
        selectedShape.value = null
        selectedArrow.value = null
        selectedDrawingPath.value = null
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
    if (!connectionState.value.startPoint) {
      return
    }

    const startPoint = connectionState.value.startPoint
    
    if (startPoint.shapeId === endShapeId) {
      cancelConnection()
      return
    }

    const arrowData = {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: endPoint.x,
      endY: endPoint.y,
      startShapeId: startPoint.shapeId,
      endShapeId: endShapeId,
      startDotId: startPoint.dotId,
      endDotId: endDotId
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

  const setDrawingColor = (color: string) => {
    currentDrawingColor.value = color
  }

  const setDrawingStrokeWidth = (width: number) => {
    currentDrawingStrokeWidth.value = width
  }

  const rotateElement = (elementType: 'shape' | 'arrow' | 'drawingPath', id: string, angle: number) => {
    if (elementType === 'shape') {
      const shape = shapes.value.find(s => s.id === id)
      if (shape) {
        shape.rotation = normalizeRotation((shape.rotation || 0) + angle)
        saveToLocalStorage()
      }
    } else if (elementType === 'arrow') {
      const arrow = arrows.value.find(a => a.id === id)
      if (arrow) {
        arrow.rotation = normalizeRotation((arrow.rotation || 0) + angle)
        saveToLocalStorage()
      }
    } else if (elementType === 'drawingPath') {
      const path = drawingPaths.value.find(p => p.id === id)
      if (path) {
        path.rotation = normalizeRotation((path.rotation || 0) + angle)
        saveToLocalStorage()
      }
    }
  }

  const setElementRotation = (elementType: 'shape' | 'arrow' | 'drawingPath', id: string, rotation: number) => {
    if (elementType === 'shape') {
      const shape = shapes.value.find(s => s.id === id)
      if (shape) {
        shape.rotation = normalizeRotation(rotation)
        saveToLocalStorage()
      }
    } else if (elementType === 'arrow') {
      const arrow = arrows.value.find(a => a.id === id)
      if (arrow) {
        arrow.rotation = normalizeRotation(rotation)
        saveToLocalStorage()
      }
    } else if (elementType === 'drawingPath') {
      const path = drawingPaths.value.find(p => p.id === id)
      if (path) {
        path.rotation = normalizeRotation(rotation)
        saveToLocalStorage()
      }
    }
  }

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
  
  // Load from localStorage on store initialization
  loadFromLocalStorage()
  
  return {
    shapes,
    arrows,
    drawingPaths,
    selectedShape,
    selectedArrow,
    selectedDrawingPath,
    tool,
    setTool,
    addShape,
    addArrow,
    addDrawingPath,
    selectShape,
    selectArrow,
    selectDrawingPath,
    clearSelection,
    moveShape,
    moveDrawingPath,
    updateConnectedArrows,
    updateConnectedArrowsForDrawingPath,
    getDrawingPathAtPoint,
    getClosestConnectionPointForPath,
    deleteShape,
    deleteArrow,
    deleteDrawingPath,
    deleteSelected,
    clearCanvas,
    loadDiagram,
    updateShapeText,
    saveToLocalStorage,
    loadFromLocalStorage,
    updateShapeFontSize,
    getShapeConnectionPoints,
    getDrawingPathConnectionPoints,
    getClosestConnectionPoint,
    connectionState,
    startConnection,
    completeConnection,
    cancelConnection,
    convertArrowToCurved,
    addControlPoint,
    updateControlPoint,
    removeControlPoint,
    currentDrawingColor,
    currentDrawingStrokeWidth,
    setDrawingColor,
    setDrawingStrokeWidth,
    rotateElement,
    setElementRotation
  }
})