import { ref } from 'vue'
import { useDiagramStore, type Shape, type Arrow } from '../stores/diagram'

export function useSelection() {
  const diagramStore = useDiagramStore()
  
  const selectedShapeIds = ref<string[]>([])
  const selectedArrowIds = ref<string[]>([])
  
  const isSelecting = ref(false)
  const selectionStart = ref({ x: 0, y: 0 })
  const selectionEnd = ref({ x: 0, y: 0 })

  const clearAllSelections = () => {
    selectedShapeIds.value = []
    selectedArrowIds.value = []
    diagramStore.shapes.forEach(shape => {
      shape.selected = false
    })
    diagramStore.arrows.forEach(arrow => {
      arrow.selected = false
    })
    diagramStore.clearSelection()
  }

  const selectShape = (shape: Shape, event?: MouseEvent) => {
    if (event && (event.ctrlKey || event.metaKey)) {
      if (selectedShapeIds.value.includes(shape.id)) {
        selectedShapeIds.value = selectedShapeIds.value.filter(id => id !== shape.id)
        shape.selected = false
      } else {
        selectedShapeIds.value.push(shape.id)
        shape.selected = true
      }
    } else {
      clearAllSelections()
      diagramStore.selectShape(shape)
      selectedShapeIds.value = [shape.id]
    }
  }

  const selectArrow = (arrow: Arrow, event?: MouseEvent) => {
    if (event && (event.ctrlKey || event.metaKey)) {
      if (selectedArrowIds.value.includes(arrow.id)) {
        selectedArrowIds.value = selectedArrowIds.value.filter(id => id !== arrow.id)
        arrow.selected = false
      } else {
        selectedArrowIds.value.push(arrow.id)
        arrow.selected = true
      }
    } else {
      clearAllSelections()
      selectedArrowIds.value = [arrow.id]
      arrow.selected = true
      diagramStore.selectArrow(arrow)
    }
  }

  const startSelectionBox = (worldPos: { x: number; y: number }) => {
    isSelecting.value = true
    selectionStart.value = worldPos
    selectionEnd.value = worldPos
  }

  const updateSelectionBox = (worldPos: { x: number; y: number }) => {
    if (isSelecting.value) {
      selectionEnd.value = worldPos
    }
  }

  const completeSelectionBox = () => {
    if (!isSelecting.value) return

    const minX = Math.min(selectionStart.value.x, selectionEnd.value.x)
    const maxX = Math.max(selectionStart.value.x, selectionEnd.value.x)
    const minY = Math.min(selectionStart.value.y, selectionEnd.value.y)
    const maxY = Math.max(selectionStart.value.y, selectionEnd.value.y)
    
    diagramStore.shapes.forEach(shape => {
      let intersects = false
      
      if (shape.type === 'text') {
        const textWidth = (shape.text?.length || 20) * (shape.fontSize ?? 14) * 0.6
        const textHeight = shape.fontSize ?? 14
        intersects = !(shape.x > maxX || 
                      shape.x + textWidth < minX ||
                      shape.y - textHeight > maxY ||
                      shape.y < minY)
      } else {
        intersects = !(shape.x > maxX || 
                      shape.x + shape.width < minX ||
                      shape.y > maxY ||
                      shape.y + shape.height < minY)
      }
      
      if (intersects && !selectedShapeIds.value.includes(shape.id)) {
        selectedShapeIds.value.push(shape.id)
        shape.selected = true
      }
    })
    
    diagramStore.arrows.forEach(arrow => {
      const arrowMinX = Math.min(arrow.startX, arrow.endX)
      const arrowMaxX = Math.max(arrow.startX, arrow.endX)
      const arrowMinY = Math.min(arrow.startY, arrow.endY)
      const arrowMaxY = Math.max(arrow.startY, arrow.endY)
      
      const intersects = !(arrowMinX > maxX || 
                          arrowMaxX < minX ||
                          arrowMinY > maxY ||
                          arrowMaxY < minY)
      
      if (intersects && !selectedArrowIds.value.includes(arrow.id)) {
        selectedArrowIds.value.push(arrow.id)
        arrow.selected = true
      }
    })

    isSelecting.value = false
  }

  return {
    selectedShapeIds,
    selectedArrowIds,
    isSelecting,
    selectionStart,
    selectionEnd,
    clearAllSelections,
    selectShape,
    selectArrow,
    startSelectionBox,
    updateSelectionBox,
    completeSelectionBox
  }
}