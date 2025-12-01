import { ref } from 'vue'
import { useDiagramStore, type Shape, type Arrow, type DrawingPath } from '../stores/diagram'

export function useDrawing() {
  const diagramStore = useDiagramStore()
  
  const isDrawing = ref(false)
  const startPoint = ref({ x: 0, y: 0 })
  const currentPoint = ref({ x: 0, y: 0 })
  const pencilPoints = ref<Array<{ x: number, y: number }>>([])

  const startDrawing = (worldPos: { x: number; y: number }) => {
    isDrawing.value = true
    startPoint.value = worldPos
    currentPoint.value = worldPos
    
    if (diagramStore.tool === 'pencil') {
      pencilPoints.value = [worldPos]
    }
    
    diagramStore.clearSelection()
  }

  const updateDrawing = (worldPos: { x: number; y: number }) => {
    if (isDrawing.value) {
      currentPoint.value = worldPos
      
      if (diagramStore.tool === 'pencil') {
        // Add point to pencil path if it's far enough from the last point
        const lastPoint = pencilPoints.value[pencilPoints.value.length - 1]
        if (lastPoint) {
          const distance = Math.sqrt(
            Math.pow(worldPos.x - lastPoint.x, 2) + Math.pow(worldPos.y - lastPoint.y, 2)
          )
          if (distance > 2) { // Minimum distance between points
            pencilPoints.value.push(worldPos)
          }
        }
      }
    }
  }

  const completeDrawing = (worldPos: { x: number; y: number }, zoom: number) => {
    if (!isDrawing.value) return

    if (diagramStore.tool === 'pencil') {
      // Add final point and create drawing path
      if (pencilPoints.value.length > 1) {
        pencilPoints.value.push(worldPos)
        
        diagramStore.addDrawingPath({
          points: [...pencilPoints.value]
          // stroke and strokeWidth will be set by the store from current drawing properties
        })
      }
      
      // Reset pencil state
      pencilPoints.value = []
    } else if (diagramStore.tool === 'arrow') {
      const distance = Math.sqrt(
        Math.pow(worldPos.x - startPoint.value.x, 2) + Math.pow(worldPos.y - startPoint.value.y, 2)
      )
      
      if (distance > 20 / zoom) {
        // Check for nearby shapes at start and end points
        const startShape = diagramStore.shapes.find(shape => {
          const margin = 30
          return startPoint.value.x >= shape.x - margin && 
                 startPoint.value.x <= shape.x + shape.width + margin &&
                 startPoint.value.y >= shape.y - margin && 
                 startPoint.value.y <= shape.y + shape.height + margin
        })
        
        const endShape = diagramStore.shapes.find(shape => {
          const margin = 30
          return worldPos.x >= shape.x - margin && 
                 worldPos.x <= shape.x + shape.width + margin &&
                 worldPos.y >= shape.y - margin && 
                 worldPos.y <= shape.y + shape.height + margin
        })
        
        const arrowData: any = {
          startX: startPoint.value.x,
          startY: startPoint.value.y,
          endX: worldPos.x,
          endY: worldPos.y
        }
        
        // Add shape connections if found
        if (startShape) {
          arrowData.startShapeId = startShape.id
        }
        if (endShape) {
          arrowData.endShapeId = endShape.id
        }
        
        console.log('Creating arrow with auto-connection:', arrowData)
        diagramStore.addArrow(arrowData)
      }
    } else {
      const width = Math.abs(worldPos.x - startPoint.value.x)
      const height = Math.abs(worldPos.y - startPoint.value.y)
      
      if (width > 10 / zoom && height > 10 / zoom) {
        const shapeData = {
          x: Math.min(startPoint.value.x, worldPos.x),
          y: Math.min(startPoint.value.y, worldPos.y),
          width,
          height,
          type: diagramStore.tool as 'rectangle' | 'circle' | 'text'
        }
        
        if (diagramStore.tool === 'text') {
          const baseFontSize = 14
          const fixedFontSize = Math.max(8, Math.min(72, baseFontSize / zoom))
          
          const newShape = {
            ...shapeData,
            text: '',
            fontSize: fixedFontSize,
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0
          }
          diagramStore.addShape(newShape)
        } else {
          const baseFontSize = 14
          const fixedFontSize = Math.max(8, Math.min(72, baseFontSize / zoom))
          const shapeWithProps = {
            ...shapeData,
            fontSize: fixedFontSize,
            fill: 'white',
            stroke: '#cccccc',
            strokeWidth: 1
          }
          diagramStore.addShape(shapeWithProps)
        }
      }
    }

    isDrawing.value = false
  }

  return {
    isDrawing,
    startPoint,
    currentPoint,
    pencilPoints,
    startDrawing,
    updateDrawing,
    completeDrawing
  }
}