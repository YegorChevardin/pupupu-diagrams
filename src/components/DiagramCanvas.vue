<template>
  <div class="canvas-container">
    <ZoomControls 
      :zoom="canvasInteraction.zoom.value" 
      @zoom-in="canvasInteraction.zoomIn" 
      @zoom-out="canvasInteraction.zoomOut" 
      @reset-zoom="canvasInteraction.resetZoom" 
    />
    
    <svg
      ref="svgCanvas"
      class="diagram-canvas"
      :class="{ 'panning': canvasInteraction.isPanning.value }"
      :style="{ cursor: canvasCursor }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="(e) => canvasInteraction.handleWheel(e, svgCanvas!)"
      @contextmenu.prevent
    >
      <CanvasBackground />
      <ArrowMarkers :zoom="canvasInteraction.zoom.value" />
      

      
      <g :transform="`translate(${canvasInteraction.panX.value}, ${canvasInteraction.panY.value}) scale(${canvasInteraction.zoom.value})`">
        <template v-for="element in allElementsSorted" :key="element.id">
          <ArrowRenderer
            v-if="element.elementType === 'arrow'"
            :arrow="element as any"
            :is-selected="(element as any).selected || selection.selectedArrowIds.value.includes(element.id)"
            :zoom="canvasInteraction.zoom.value"
            @select="handleArrowSelect"
            @start-move="handleArrowStartMove"
            @start-drag="handleArrowStartDrag"
          />
          
          <DrawingPathRenderer
            v-else-if="element.elementType === 'drawingPath'"
            :drawing-path="element as any"
            :is-selected="(element as any).selected || selection.selectedDrawingPathIds.value.includes(element.id)"
            :zoom="canvasInteraction.zoom.value"
            @select="handleDrawingPathSelect"
            @start-move="handleDrawingPathStartMove"
            @start-resize="handleDrawingPathStartResize"
          />
          

          
          <ShapeRenderer
            v-else
            :shape="element as any"
            :is-selected="(element as any).selected || selection.selectedShapeIds.value.includes(element.id)"
            :zoom="canvasInteraction.zoom.value"
            @select="handleShapeSelect"
            @edit-text="startTextEdit"
          />
          
          <ConnectionDots
            v-if="element.elementType === 'shape' && ((element as any).selected || selection.selectedShapeIds.value.includes(element.id) || diagramStore.tool === 'arrow' || diagramStore.connectionState.isConnecting)"
            :shape="element as any"
            :show-dots="true"
            :dot-size="4 / canvasInteraction.zoom.value"
          />
          
          <ConnectionDots
            v-if="element.elementType === 'drawingPath' && ((element as any).selected || selection.selectedDrawingPathIds.value.includes(element.id) || diagramStore.tool === 'arrow' || diagramStore.connectionState.isConnecting)"
            :drawing-path="element as any"
            :show-dots="true"
            :dot-size="4 / canvasInteraction.zoom.value"
          />
        </template>
        
        <DrawingPreview
          :is-drawing="drawing.isDrawing.value"
          :tool="diagramStore.tool"
          :start-point="drawing.startPoint.value"
          :current-point="drawing.currentPoint.value"
          :pencil-points="drawing.pencilPoints.value"
          :zoom="canvasInteraction.zoom.value"
        />
        
        <SelectionHandles
          :selected-shape="selectedShapeForHandles"
          :zoom="canvasInteraction.zoom.value"
          @start-resize="startResize"
        />
        
        <SelectionBox
          :is-selecting="selection.isSelecting.value"
          :selection-start="selection.selectionStart.value"
          :selection-end="selection.selectionEnd.value"
          :zoom="canvasInteraction.zoom.value"
        />
      </g>
    </svg>
      
      <InlineTextEditor
        :visible="isEditingText"
        :position="textInputPosition"
        :text="textInput"
        :font-size="currentFontSize"
        :text-align="editingShape?.type === 'text' ? 'left' : 'center'"
        @update:text="textInput = $event"
        @finish="finishTextEdit"
        @cancel="cancelTextEdit"
      />
      
      <PropertiesPanel
        :visible="showPropertiesPanel"
        :position="propertiesPanelPosition"
        :element-type="selectedElementType"
        :show-text-controls="shouldShowTextControls"
        :show-shape-controls="shouldShowShapeControls"
        :font-size="currentFontSizeForPanel"
        :selected-fill="selectedShape?.fill || 'white'"
        :selected-stroke="selectedArrow?.stroke || '#000000'"
        :stroke-width="selectedArrow?.strokeWidth || 1"
        @close="hidePropertiesPanel"
        @update:font-size="updateSelectedFontSize"
        @update:fill="updateSelectedFill"
        @update:stroke="updateSelectedStroke"
        @update:stroke-width="updateSelectedStrokeWidth"
      />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useDiagramStore, type Shape, type Arrow, type DrawingPath } from '../stores/diagram.js'
import { useCanvasInteraction } from '../composables/useCanvasInteraction'
import { useSelection } from '../composables/useSelection'
import { useDrawing } from '../composables/useDrawing'
import { useGeometry } from '../composables/useGeometry'

import ZoomControls from './ZoomControls.vue'
import InlineTextEditor from './InlineTextEditor.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import CanvasBackground from './canvas/CanvasBackground.vue'
import ArrowMarkers from './canvas/ArrowMarkers.vue'
import ArrowRenderer from './canvas/ArrowRenderer.vue'
import ShapeRenderer from './canvas/ShapeRenderer.vue'
import DrawingPathRenderer from './canvas/DrawingPathRenderer.vue'
import DrawingPreview from './canvas/DrawingPreview.vue'
import SelectionBox from './canvas/SelectionBox.vue'
import SelectionHandles from './canvas/SelectionHandles.vue'
import ConnectionDots from './ConnectionDots.vue'

const diagramStore = useDiagramStore()
const canvasInteraction = useCanvasInteraction()
const selection = useSelection()
const drawing = useDrawing()
const geometry = useGeometry()

const svgCanvas = ref<SVGSVGElement>()
const isResizing = ref(false)
const isDragging = ref(false)
const dragStartPoint = ref({ x: 0, y: 0 })
const originalShapePositions = ref<Map<string, { x: number, y: number }>>(new Map())
const resizeHandle = ref('')
const resizeStartPoint = ref({ x: 0, y: 0 })
const originalShapeSize = ref({ x: 0, y: 0, width: 0, height: 0 })

const isEditingText = ref(false)
const editingShapeId = ref<string | null>(null)
const textInput = ref('')
const textInputPosition = ref({ x: 0, y: 0 })
const currentFontSize = ref(14)

const isDraggingArrow = ref(false)
const draggingArrow = ref<{ arrow: Arrow; endpoint: 'start' | 'end' } | null>(null)
const isMovingArrow = ref(false)
const movingArrowOffset = ref({ x: 0, y: 0 })

const showPropertiesPanel = ref(false)
const propertiesPanelPosition = ref({ x: 0, y: 0 })
const editingShape = ref<Shape | null>(null)

watch(() => [selection.selectedShapeIds.value.length, selection.selectedArrowIds.value.length], (counts) => {
  const [shapeCount, arrowCount] = counts
  if (shapeCount === 0 && arrowCount === 0) {
    hidePropertiesPanel()
  }
})

watch(() => diagramStore.tool, () => {
  if (diagramStore.tool !== 'select') {
    hidePropertiesPanel()
  }
})

const handleArrowSelect = (arrow: Arrow, event?: MouseEvent) => {
  selection.selectArrow(arrow, event)
  if (event) {
    showPropertiesPanelFor(arrow)
  }
}

const handleShapeSelect = (shape: Shape, event?: MouseEvent) => {
  selection.selectShape(shape, event)
  if (event) {
    showPropertiesPanelFor(shape)
  }
}

const handleDrawingPathSelect = (drawingPath: DrawingPath, event?: MouseEvent) => {
  selection.selectDrawingPath(drawingPath, event)
  if (event) {
    showPropertiesPanelFor(drawingPath)
  }
}

const isDrawingPathDragging = ref(false)
const draggingDrawingPath = ref<DrawingPath | null>(null)
const drawingPathDragStart = ref({ x: 0, y: 0 })

const handleDrawingPathStartMove = (drawingPath: DrawingPath, event: MouseEvent) => {
  event.stopPropagation()
  if (!selection.selectedDrawingPathIds.value.includes(drawingPath.id)) {
    handleDrawingPathSelect(drawingPath)
  }
  
  isDrawingPathDragging.value = true
  draggingDrawingPath.value = drawingPath
  
  const rect = svgCanvas.value!.getBoundingClientRect()
  const worldPos = canvasInteraction.screenToWorld(event.clientX - rect.left, event.clientY - rect.top)
  drawingPathDragStart.value = { x: worldPos.x, y: worldPos.y }
}

const isResizingDrawingPath = ref(false)
const resizingDrawingPath = ref<DrawingPath | null>(null)
const resizeDrawingPathHandle = ref('')

const handleDrawingPathStartResize = (drawingPath: DrawingPath, handle: string, event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()
  
  isResizingDrawingPath.value = true
  resizingDrawingPath.value = drawingPath
  resizeDrawingPathHandle.value = handle
  
  const rect = svgCanvas.value!.getBoundingClientRect()
  const worldPos = canvasInteraction.screenToWorld(event.clientX - rect.left, event.clientY - rect.top)
  drawingPathDragStart.value = { x: worldPos.x, y: worldPos.y }
}

const handleArrowStartMove = (arrow: Arrow, event: MouseEvent) => {
  event.stopPropagation()
  if (!selection.selectedArrowIds.value.includes(arrow.id)) {
    handleArrowSelect(arrow)
  }
  
  if (arrow.startShapeId || arrow.endShapeId) {
    return
  }
  
  isMovingArrow.value = true
  const rect = svgCanvas.value!.getBoundingClientRect()
  const worldPos = canvasInteraction.screenToWorld(event.clientX - rect.left, event.clientY - rect.top)
  movingArrowOffset.value = {
    x: worldPos.x - arrow.startX,
    y: worldPos.y - arrow.startY
  }
}

const handleArrowStartDrag = (arrow: Arrow, endpoint: 'start' | 'end', event: MouseEvent) => {
  console.log('🔵 Canvas received startDrag:', arrow.id, 'endpoint:', endpoint)
  event.stopPropagation()
  event.preventDefault()
  
  const storeArrow = diagramStore.arrows.find(a => a.id === arrow.id)
  if (!storeArrow) {
    console.error('🔵 Arrow not found in store:', arrow.id)
    return
  }
  
  isDraggingArrow.value = true
  draggingArrow.value = { arrow: storeArrow, endpoint }
  console.log('🔵 Set isDraggingArrow to true, using store arrow')
  
  if (endpoint === 'start' && storeArrow.startShapeId) {
    console.log('🔵 Unlinking start endpoint from shape:', storeArrow.startShapeId)
    storeArrow.startShapeId = undefined
  } else if (endpoint === 'end' && storeArrow.endShapeId) {
    console.log('🔵 Unlinking end endpoint from shape:', storeArrow.endShapeId)
    storeArrow.endShapeId = undefined
  }
  
  if (!selection.selectedArrowIds.value.includes(arrow.id)) {
    selection.selectArrow(storeArrow)
  }
}

const handleMouseDown = (event: MouseEvent) => {
  if (isResizing.value) return
  
  const rect = svgCanvas.value!.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  const worldPos = canvasInteraction.screenToWorld(screenX, screenY)
  
  canvasInteraction.lastPanPoint.value = { x: screenX, y: screenY }
  
  if (event.button === 1) {
    canvasInteraction.isWheelPressed.value = true
    canvasInteraction.isPanning.value = true
    event.preventDefault()
    return
  }
  
  if (diagramStore.tool === 'select') {
    const clickedShape = geometry.getShapeAtPoint(worldPos.x, worldPos.y)
    const clickedArrow = geometry.getArrowAtPoint(worldPos.x, worldPos.y)
    const clickedDrawingPath = geometry.getDrawingPathAtPoint(worldPos.x, worldPos.y)
    

    
    if (clickedDrawingPath) {
      if (event.ctrlKey || event.metaKey) {
        if (selection.selectedDrawingPathIds.value.includes(clickedDrawingPath.id)) {
          selection.selectedDrawingPathIds.value = selection.selectedDrawingPathIds.value.filter(id => id !== clickedDrawingPath.id)
          clickedDrawingPath.selected = false
        } else {
          selection.selectedDrawingPathIds.value.push(clickedDrawingPath.id)
          clickedDrawingPath.selected = true
        }
      } else if (selection.selectedDrawingPathIds.value.includes(clickedDrawingPath.id)) {
        isDrawingPathDragging.value = true
        draggingDrawingPath.value = clickedDrawingPath
        drawingPathDragStart.value = worldPos
      } else {
        selection.clearAllSelections()
        handleDrawingPathSelect(clickedDrawingPath, event)
        isDrawingPathDragging.value = true
        draggingDrawingPath.value = clickedDrawingPath
        drawingPathDragStart.value = worldPos
      }
    } else if (clickedShape) {
      if (event.ctrlKey || event.metaKey) {
        if (selection.selectedShapeIds.value.includes(clickedShape.id)) {
          selection.selectedShapeIds.value = selection.selectedShapeIds.value.filter(id => id !== clickedShape.id)
          clickedShape.selected = false
        } else {
          selection.selectedShapeIds.value.push(clickedShape.id)
          clickedShape.selected = true
        }
      } else if (selection.selectedShapeIds.value.includes(clickedShape.id)) {
        isDragging.value = true
        dragStartPoint.value = worldPos
        originalShapePositions.value.clear()
        selection.selectedShapeIds.value.forEach(shapeId => {
          const shape = diagramStore.shapes.find(s => s.id === shapeId)
          if (shape) {
            originalShapePositions.value.set(shapeId, { x: shape.x, y: shape.y })
          }
        })
      } else {
        selection.clearAllSelections()
        diagramStore.selectShape(clickedShape)
        selection.selectedShapeIds.value = [clickedShape.id]
        isDragging.value = true
        dragStartPoint.value = worldPos
        originalShapePositions.value.clear()
        originalShapePositions.value.set(clickedShape.id, { x: clickedShape.x, y: clickedShape.y })
      }
    } else if (clickedArrow) {
      handleArrowSelect(clickedArrow, event)
    } else {
      if (!event.ctrlKey && !event.metaKey) {
        selection.clearAllSelections()
        hidePropertiesPanel()
      }
      selection.startSelectionBox(worldPos)
    }
  } else {
    drawing.startDrawing(worldPos)
    selection.clearAllSelections()
    hidePropertiesPanel()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!svgCanvas.value) return
  
  const rect = svgCanvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  const worldPos = canvasInteraction.screenToWorld(screenX, screenY)
  
  if (isDraggingArrow.value) {
    console.log('🔵 Mouse move during arrow drag:', {
      isDraggingArrow: isDraggingArrow.value,
      draggingArrow: draggingArrow.value,
      worldPos
    })
    diagramStore.saveToLocalStorage()
  }  drawing.updateDrawing(worldPos)
  
  if (canvasInteraction.isPanning.value && canvasInteraction.isWheelPressed.value) {
    const dx = screenX - canvasInteraction.lastPanPoint.value.x
    const dy = screenY - canvasInteraction.lastPanPoint.value.y
    canvasInteraction.panX.value += dx
    canvasInteraction.panY.value += dy
    canvasInteraction.lastPanPoint.value = { x: screenX, y: screenY }
  } else if (selection.isSelecting.value) {
    selection.updateSelectionBox(worldPos)
  } else if (isDraggingArrow.value && draggingArrow.value) {
    const { arrow, endpoint } = draggingArrow.value
    console.log('🔵 Dragging arrow endpoint:', endpoint, 'to position:', worldPos, 'arrowId:', arrow.id)
    
    const storeArrow = diagramStore.arrows.find(a => a.id === arrow.id)
    if (storeArrow) {
      if (endpoint === 'start') {
        storeArrow.startX = worldPos.x
        storeArrow.startY = worldPos.y
      } else {
        storeArrow.endX = worldPos.x
        storeArrow.endY = worldPos.y
      }
    }
    
    const nearbyShape = diagramStore.shapes.find(shape => {
      const margin = 30
      return worldPos.x >= shape.x - margin && 
             worldPos.x <= shape.x + shape.width + margin &&
             worldPos.y >= shape.y - margin && 
             worldPos.y <= shape.y + shape.height + margin
    })
    
    if (nearbyShape && storeArrow) {
      const connectionPoint = diagramStore.getClosestConnectionPoint(nearbyShape, worldPos.x, worldPos.y)
      if (endpoint === 'start') {
        storeArrow.startX = connectionPoint.x
        storeArrow.startY = connectionPoint.y
        storeArrow.startShapeId = nearbyShape.id
        console.log('🔵 Auto-connected start to shape:', nearbyShape.id)
      } else {
        storeArrow.endX = connectionPoint.x
        storeArrow.endY = connectionPoint.y
        storeArrow.endShapeId = nearbyShape.id
        console.log('🔵 Auto-connected end to shape:', nearbyShape.id)
      }
    } else if (storeArrow) {
      if (endpoint === 'start') {
        storeArrow.startShapeId = undefined
      } else {
        storeArrow.endShapeId = undefined
      }
    }
  } else if (isMovingArrow.value && selection.selectedArrowIds.value.length > 0) {
    const newStartX = worldPos.x - movingArrowOffset.value.x
    const newStartY = worldPos.y - movingArrowOffset.value.y
    
    selection.selectedArrowIds.value.forEach(arrowId => {
      const arrow = diagramStore.arrows.find(a => a.id === arrowId)
      if (arrow) {
        const deltaX = newStartX - arrow.startX
        const deltaY = newStartY - arrow.startY
        arrow.startX = newStartX
        arrow.startY = newStartY
        arrow.endX += deltaX
        arrow.endY += deltaY
      }
    })
  } else if (isDragging.value) {
    if (selection.selectedShapeIds.value.length > 0) {
      const dx = worldPos.x - dragStartPoint.value.x
      const dy = worldPos.y - dragStartPoint.value.y
      selection.selectedShapeIds.value.forEach(shapeId => {
        const shape = diagramStore.shapes.find(s => s.id === shapeId)
        const originalPos = originalShapePositions.value.get(shapeId)
        if (shape && originalPos) {
          shape.x = originalPos.x + dx
          shape.y = originalPos.y + dy
          diagramStore.updateConnectedArrows(shapeId)
        }
      })
    }
  } else if (isDrawingPathDragging.value && draggingDrawingPath.value) {
    const deltaX = worldPos.x - drawingPathDragStart.value.x
    const deltaY = worldPos.y - drawingPathDragStart.value.y
    
    diagramStore.moveDrawingPath(draggingDrawingPath.value.id, deltaX, deltaY)
    
    drawingPathDragStart.value = worldPos
  } else if (isResizingDrawingPath.value && resizingDrawingPath.value) {
    const handle = resizeDrawingPathHandle.value
    const path = resizingDrawingPath.value
    
    if (path.points.length > 0) {
      const originalMinX = path.minX || 0
      const originalMinY = path.minY || 0
      const originalMaxX = path.maxX || 0
      const originalMaxY = path.maxY || 0
      const originalWidth = originalMaxX - originalMinX
      const originalHeight = originalMaxY - originalMinY
      
      let newWidth = originalWidth
      let newHeight = originalHeight
      
      switch (handle) {
        case 'bottom-right':
          newWidth = Math.max(10, worldPos.x - originalMinX)
          newHeight = Math.max(10, worldPos.y - originalMinY)
          break
        case 'top-left':
          newWidth = Math.max(10, originalMaxX - worldPos.x)
          newHeight = Math.max(10, originalMaxY - worldPos.y)
          break
        case 'top-right':
          newWidth = Math.max(10, worldPos.x - originalMinX)
          newHeight = Math.max(10, originalMaxY - worldPos.y)
          break
        case 'bottom-left':
          newWidth = Math.max(10, originalMaxX - worldPos.x)
          newHeight = Math.max(10, worldPos.y - originalMinY)
          break
      }
      
      const scaleX = originalWidth > 0 ? newWidth / originalWidth : 1
      const scaleY = originalHeight > 0 ? newHeight / originalHeight : 1
      
      if (scaleX > 0.1 && scaleY > 0.1 && scaleX < 10 && scaleY < 10) {
        let anchorX = originalMinX
        let anchorY = originalMinY
        
        switch (handle) {
          case 'top-left':
            anchorX = originalMaxX
            anchorY = originalMaxY
            break
          case 'top-right':
            anchorX = originalMinX
            anchorY = originalMaxY
            break
          case 'bottom-left':
            anchorX = originalMaxX
            anchorY = originalMinY
            break
        }
        
        path.points.forEach(point => {
          point.x = anchorX + (point.x - anchorX) * scaleX
          point.y = anchorY + (point.y - anchorY) * scaleY
        })
        
        const xs = path.points.map(p => p.x)
        const ys = path.points.map(p => p.y)
        path.minX = Math.min(...xs)
        path.minY = Math.min(...ys)
        path.maxX = Math.max(...xs)
        path.maxY = Math.max(...ys)
      }
    }
  } else if (isResizing.value && diagramStore.selectedShape) {
    const dx = worldPos.x - resizeStartPoint.value.x
    const dy = worldPos.y - resizeStartPoint.value.y
    const selectedId = diagramStore.selectedShape.id
    const shape = diagramStore.shapes.find(s => s.id === selectedId)
    const original = originalShapeSize.value
    
    if (!shape) return
    
    switch (resizeHandle.value) {
      case 'nw':
        shape.x = original.x + dx
        shape.y = original.y + dy
        shape.width = Math.max(20, original.width - dx)
        shape.height = Math.max(20, original.height - dy)
        break
      case 'ne':
        shape.y = original.y + dy
        shape.width = Math.max(20, original.width + dx)
        shape.height = Math.max(20, original.height - dy)
        break
      case 'sw':
        shape.x = original.x + dx
        shape.width = Math.max(20, original.width - dx)
        shape.height = Math.max(20, original.height + dy)
        break
      case 'se':
        shape.width = Math.max(20, original.width + dx)
        shape.height = Math.max(20, original.height + dy)
        break
    }
  }
}

const handleMouseUp = (event: MouseEvent) => {
  if (!svgCanvas.value) return
  
  const rect = svgCanvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  const worldPos = canvasInteraction.screenToWorld(screenX, screenY)



  if (drawing.isDrawing.value) {
    drawing.completeDrawing(worldPos, canvasInteraction.zoom.value)
    
    if (diagramStore.tool === 'text') {
      setTimeout(() => {
        const addedShape = diagramStore.shapes[diagramStore.shapes.length - 1]
        if (addedShape) {
          startTextEdit(addedShape)
        }
      }, 10)
    }
  }
  
  if (selection.isSelecting.value) {
    selection.completeSelectionBox()
  }
  
  if (isDragging.value && selection.selectedShapeIds.value.length > 0) {
    diagramStore.saveToLocalStorage()
  }
  if (isResizing.value) {
    diagramStore.saveToLocalStorage()
  }
  isDragging.value = false
  originalShapePositions.value.clear()
  if (isDraggingArrow.value || isMovingArrow.value) {
    diagramStore.saveToLocalStorage()
  }
  if (isDrawingPathDragging.value || isResizingDrawingPath.value) {
    diagramStore.saveToLocalStorage()
  }
  isDraggingArrow.value = false
  draggingArrow.value = null
  isMovingArrow.value = false
  isDrawingPathDragging.value = false
  draggingDrawingPath.value = null
  isResizingDrawingPath.value = false
  resizingDrawingPath.value = null
  isResizing.value = false
  canvasInteraction.isPanning.value = false
  canvasInteraction.isWheelPressed.value = false
}





const startResize = (event: MouseEvent, handleType: string) => {
  event.stopPropagation()
  if (!diagramStore.selectedShape) return
  
  const rect = svgCanvas.value!.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  const worldPos = canvasInteraction.screenToWorld(screenX, screenY)
  
  isResizing.value = true
  resizeHandle.value = handleType
  resizeStartPoint.value = worldPos
  
  const shape = diagramStore.selectedShape
  originalShapeSize.value = {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height
  }
}

const canvasCursor = computed(() => {
  if (canvasInteraction.isPanning.value) {
    return 'grabbing'
  }
  if (isDragging.value || isDraggingArrow.value || isMovingArrow.value || isResizing.value) {
    return 'move'
  }
  return 'crosshair'
})

const startTextEdit = (shape: Shape) => {
  if (isEditingText.value) return
  
  isEditingText.value = true
  editingShapeId.value = shape.id
  editingShape.value = shape
  textInput.value = shape.text || ''
  currentFontSize.value = shape.fontSize || 14
  
  const rect = svgCanvas.value!.getBoundingClientRect()
  let worldX: number, worldY: number
  
  if (shape.type === 'text') {
    worldX = shape.x
    worldY = shape.y - (shape.fontSize || 14)
  } else {
    worldX = shape.x + shape.width / 2 - 50
    worldY = shape.y + shape.height / 2 - 10
  }
  
  const screenX = rect.left + (worldX * canvasInteraction.zoom.value + canvasInteraction.panX.value)
  const screenY = rect.top + (worldY * canvasInteraction.zoom.value + canvasInteraction.panY.value)
  
  textInputPosition.value = { x: screenX, y: screenY }
  hidePropertiesPanel()
}

const selectedElementType = computed(() => {
  if (diagramStore.selectedShape) {
    return diagramStore.selectedShape.type === 'text' ? 'text' : 'shape'
  }
  if (diagramStore.selectedArrow) {
    return 'arrow'
  }
  return null
})

const shouldShowTextControls = computed(() => {
  if (!diagramStore.selectedShape) return false
  return diagramStore.selectedShape.type === 'text' || 
         Boolean(diagramStore.selectedShape.text && diagramStore.selectedShape.text.trim())
})

const shouldShowShapeControls = computed(() => {
  if (!diagramStore.selectedShape) return false
  return diagramStore.selectedShape.type !== 'text'
})

const selectedShape = computed(() => diagramStore.selectedShape)
const selectedArrow = computed(() => diagramStore.selectedArrow)

const selectedShapeForHandles = computed(() => {
  if (!diagramStore.selectedShape) return null
  return diagramStore.shapes.find(s => s.id === diagramStore.selectedShape?.id) || null
})

const currentFontSizeForPanel = computed(() => {
  if (selectedShapeForHandles.value) {
    return selectedShapeForHandles.value.fontSize || 14
  }
  if (selectedArrow.value) {
    return selectedArrow.value.strokeWidth || 1
  }
  return 14
})

const allElementsSorted = computed(() => {
  const elements: Array<(Shape & { elementType: 'shape' }) | (Arrow & { elementType: 'arrow' }) | (DrawingPath & { elementType: 'drawingPath' })> = []
  
  diagramStore.shapes.forEach(shape => {
    elements.push({ ...shape, elementType: 'shape' as const })
  })
  
  diagramStore.arrows.forEach(arrow => {
    elements.push({ ...arrow, elementType: 'arrow' as const })
  })
  
  diagramStore.drawingPaths.forEach(drawingPath => {
    elements.push({ ...drawingPath, elementType: 'drawingPath' as const })
  })
  
  return elements.sort((a, b) => {
    const aTime = a.createdAt || 0
    const bTime = b.createdAt || 0
    return aTime - bTime
  })
})

const updateCurrentFontSize = (newSize: number) => {
  currentFontSize.value = newSize
  if (editingShapeId.value) {
    diagramStore.updateShapeFontSize(editingShapeId.value, newSize)
  }
}



const showPropertiesPanelFor = (element: Shape | Arrow | DrawingPath) => {
  const canvasRect = svgCanvas.value?.getBoundingClientRect()
  if (!canvasRect) return

  let elementX, elementY
  
  if ('type' in element) {
    elementX = element.x * canvasInteraction.zoom.value + canvasInteraction.panX.value
    elementY = element.y * canvasInteraction.zoom.value + canvasInteraction.panY.value
  } else if ('startX' in element) {
    elementX = element.startX * canvasInteraction.zoom.value + canvasInteraction.panX.value
    elementY = element.startY * canvasInteraction.zoom.value + canvasInteraction.panY.value
  } else {
    elementX = (element.minX || 0) * canvasInteraction.zoom.value + canvasInteraction.panX.value
    elementY = (element.minY || 0) * canvasInteraction.zoom.value + canvasInteraction.panY.value
  }
  
  const panelWidth = 220;
  const panelHeight = 120;
  const screenX = canvasRect.left + elementX;
  const screenY = canvasRect.top + elementY;
  
  propertiesPanelPosition.value = {
    x: Math.max(10, Math.min(window.innerWidth - panelWidth - 10, screenX - 10)),
    y: Math.max(10, screenY - panelHeight - 20)
  }
  showPropertiesPanel.value = true
}

const hidePropertiesPanel = () => {
  showPropertiesPanel.value = false
}

const updateSelectedFontSize = (newSize: number) => {
  if (diagramStore.selectedShape) {
    diagramStore.updateShapeFontSize(diagramStore.selectedShape.id, newSize)
  }
  
  selection.selectedShapeIds.value.forEach(shapeId => {
    const shape = diagramStore.shapes.find(s => s.id === shapeId)
    if (shape && (shape.type === 'text' || shape.text)) {
      diagramStore.updateShapeFontSize(shapeId, newSize)
    }
  })
}

const updateSelectedFill = (color: string) => {
  if (diagramStore.selectedShape) {
    ;(diagramStore.selectedShape as any).fill = color
    diagramStore.saveToLocalStorage()
  }
  selection.selectedShapeIds.value.forEach(shapeId => {
    const shape = diagramStore.shapes.find(s => s.id === shapeId)
    if (shape) {
      ;(shape as any).fill = color
    }
  })
  if (selection.selectedShapeIds.value.length > 0) {
    diagramStore.saveToLocalStorage()
  }
}

const updateSelectedStroke = (color: string) => {
  if (diagramStore.selectedArrow) {
    ;(diagramStore.selectedArrow as any).stroke = color
    diagramStore.saveToLocalStorage()
  }
  selection.selectedArrowIds.value.forEach(arrowId => {
    const arrow = diagramStore.arrows.find(a => a.id === arrowId)
    if (arrow) {
      ;(arrow as any).stroke = color
    }
  })
  if (selection.selectedArrowIds.value.length > 0) {
    diagramStore.saveToLocalStorage()
  }
}

const updateSelectedStrokeWidth = (width: number) => {
  if (diagramStore.selectedArrow) {
    ;(diagramStore.selectedArrow as any).strokeWidth = width
    diagramStore.saveToLocalStorage()
  }
  selection.selectedArrowIds.value.forEach(arrowId => {
    const arrow = diagramStore.arrows.find(a => a.id === arrowId)
    if (arrow) {
      ;(arrow as any).strokeWidth = width
    }
  })
  if (selection.selectedArrowIds.value.length > 0) {
    diagramStore.saveToLocalStorage()
  }
}

const finishTextEdit = () => {
  if (!isEditingText.value || !editingShapeId.value) return
  
  diagramStore.updateShapeText(editingShapeId.value, textInput.value)
  
  isEditingText.value = false
  editingShapeId.value = null
  textInput.value = ''
}

const cancelTextEdit = () => {
  isEditingText.value = false
  editingShapeId.value = null
  textInput.value = ''
}

onMounted(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isEditingText.value) return
    
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selection.selectedShapeIds.value.length > 0 || selection.selectedArrowIds.value.length > 0 || selection.selectedDrawingPathIds.value.length > 0) {
        selection.selectedShapeIds.value.forEach(shapeId => {
          const shapeIndex = diagramStore.shapes.findIndex(s => s.id === shapeId)
          if (shapeIndex > -1) {
            diagramStore.shapes.splice(shapeIndex, 1)
          }
        })
        selection.selectedArrowIds.value.forEach(arrowId => {
          const arrowIndex = diagramStore.arrows.findIndex(a => a.id === arrowId)
          if (arrowIndex > -1) {
            diagramStore.arrows.splice(arrowIndex, 1)
          }
        })
        selection.selectedDrawingPathIds.value.forEach(drawingPathId => {
          const drawingPathIndex = diagramStore.drawingPaths.findIndex(d => d.id === drawingPathId)
          if (drawingPathIndex > -1) {
            diagramStore.drawingPaths.splice(drawingPathIndex, 1)
          }
        })
        selection.selectedShapeIds.value = []
        selection.selectedArrowIds.value = []
        selection.selectedDrawingPathIds.value = []
        hidePropertiesPanel()
        diagramStore.saveToLocalStorage()
      } else {
        diagramStore.deleteSelected()
        hidePropertiesPanel()
      }
    } else if (event.key === 'Escape') {
      if (diagramStore.connectionState.isConnecting) {
        diagramStore.cancelConnection()
      } else {
        selection.clearAllSelections()
        hidePropertiesPanel()
      }
    } else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      selection.selectedShapeIds.value = diagramStore.shapes.map(s => s.id)
      selection.selectedArrowIds.value = diagramStore.arrows.map(a => a.id)
      selection.selectedDrawingPathIds.value = diagramStore.drawingPaths.map(d => d.id)
      diagramStore.shapes.forEach(s => s.selected = true)
      diagramStore.arrows.forEach(a => a.selected = true)
      diagramStore.drawingPaths.forEach(d => d.selected = true)
      diagramStore.shapes.forEach(s => s.selected = true)
      diagramStore.arrows.forEach(a => a.selected = true)
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  overflow: hidden;
}

.diagram-canvas {
  width: 100%;
  height: 100%;
}

.diagram-canvas.panning {
  cursor: grabbing !important;
}

.shape-text {
  cursor: pointer;
  user-select: none;
}

.selection-handle {
  cursor: pointer;
}

.arrow-handle {
  cursor: move;
}

.arrow-handle:hover {
  fill: #1976d2;
}

.text-input-overlay {
  position: absolute;
  background: white;
  border: 2px solid #2196f3;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  z-index: 1000;
  min-width: 100px;
  text-align: center;
  transform-origin: top left;
}

.text-input-overlay:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}


</style>