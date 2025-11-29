import { ref, computed } from 'vue'
import { useDiagramStore, type Shape, type Arrow } from '../stores/diagram'

export function useCanvasInteraction() {
  const diagramStore = useDiagramStore()
  
  const zoom = ref(1)
  const panX = ref(0)
  const panY = ref(0)
  const isWheelPressed = ref(false)
  const isPanning = ref(false)
  const lastPanPoint = ref({ x: 0, y: 0 })

  const screenToWorld = (screenX: number, screenY: number) => {
    return {
      x: (screenX - panX.value) / zoom.value,
      y: (screenY - panY.value) / zoom.value
    }
  }

  const zoomIn = () => {
    zoom.value = Math.min(zoom.value * 1.2, 10)
  }

  const zoomOut = () => {
    zoom.value = Math.max(zoom.value / 1.2, 0.1)
  }

  const resetZoom = () => {
    zoom.value = 1
    panX.value = 0
    panY.value = 0
  }

  const handleWheel = (event: WheelEvent, svgCanvas: SVGSVGElement) => {
    event.preventDefault()
    const rect = svgCanvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const isTrackpad = Math.abs(event.deltaY) < 50 && event.deltaMode === 0
    
    if (event.ctrlKey || event.metaKey || (!isTrackpad && !event.shiftKey)) {
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
      const oldZoom = zoom.value
      const newZoom = Math.max(0.1, Math.min(10, oldZoom * zoomFactor))
      
      const worldPos = screenToWorld(mouseX, mouseY)
      zoom.value = newZoom
      panX.value = mouseX - worldPos.x * newZoom
      panY.value = mouseY - worldPos.y * newZoom
    } else {
      const panSpeed = isTrackpad ? 1 : 0.5
      panX.value -= event.deltaX * panSpeed
      panY.value -= event.deltaY * panSpeed
    }
  }

  return {
    zoom,
    panX,
    panY,
    isWheelPressed,
    isPanning,
    lastPanPoint,
    screenToWorld,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel
  }
}