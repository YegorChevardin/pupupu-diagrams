import { ref } from 'vue'
import { useDiagramStore, type Shape, type Arrow } from '../stores/diagram'

export function useDrawing() {
  const diagramStore = useDiagramStore()
  
  const isDrawing = ref(false)
  const startPoint = ref({ x: 0, y: 0 })
  const currentPoint = ref({ x: 0, y: 0 })

  const startDrawing = (worldPos: { x: number; y: number }) => {
    isDrawing.value = true
    startPoint.value = worldPos
    currentPoint.value = worldPos
    diagramStore.clearSelection()
  }

  const updateDrawing = (worldPos: { x: number; y: number }) => {
    if (isDrawing.value) {
      currentPoint.value = worldPos
    }
  }

  const completeDrawing = (worldPos: { x: number; y: number }, zoom: number) => {
    if (!isDrawing.value) return

    if (diagramStore.tool === 'arrow') {
      const distance = Math.sqrt(
        Math.pow(worldPos.x - startPoint.value.x, 2) + Math.pow(worldPos.y - startPoint.value.y, 2)
      )
      
      if (distance > 20 / zoom) {
        diagramStore.addArrow({
          startX: startPoint.value.x,
          startY: startPoint.value.y,
          endX: worldPos.x,
          endY: worldPos.y
        })
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
          type: diagramStore.tool as 'rectangle' | 'diamond' | 'text'
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
    startDrawing,
    updateDrawing,
    completeDrawing
  }
}