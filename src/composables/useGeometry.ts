import { useDiagramStore, type Shape, type Arrow } from '../stores/diagram'

export function useGeometry() {
  const diagramStore = useDiagramStore()

  const getShapeAtPoint = (x: number, y: number): Shape | undefined => {
    for (let i = diagramStore.shapes.length - 1; i >= 0; i--) {
      const shape = diagramStore.shapes[i]
      if (!shape) continue
      
      if (shape.type === 'rectangle') {
        if (x >= shape.x && x <= shape.x + shape.width &&
            y >= shape.y && y <= shape.y + shape.height) {
          return shape
        }
      } else if (shape.type === 'diamond') {
        const cx = shape.x + shape.width / 2
        const cy = shape.y + shape.height / 2
        const hw = shape.width / 2
        const hh = shape.height / 2
        
        const dx = Math.abs(x - cx) / hw
        const dy = Math.abs(y - cy) / hh
        if (dx + dy <= 1) {
          return shape
        }
      } else if (shape.type === 'text') {
        const textWidth = (shape.text?.length || 20) * (shape.fontSize || 14) * 0.6
        const textHeight = shape.fontSize || 14
        if (x >= shape.x - 4 && x <= shape.x + textWidth + 4 &&
            y >= shape.y - textHeight - 2 && y <= shape.y + 4) {
          return shape
        }
      }
    }
    return undefined
  }

  const getArrowAtPoint = (x: number, y: number): Arrow | undefined => {
    const tolerance = 5
    return diagramStore.arrows.find((arrow: Arrow) => {
      const distance = distanceToLine(x, y, arrow.startX, arrow.startY, arrow.endX, arrow.endY)
      return distance <= tolerance
    })
  }

  const distanceToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1
    
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    
    if (lenSq !== 0) {
      param = dot / lenSq
    }
    
    let xx, yy
    
    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }
    
    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  return {
    getShapeAtPoint,
    getArrowAtPoint,
    distanceToLine
  }
}