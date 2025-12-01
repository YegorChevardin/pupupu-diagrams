import { useDiagramStore, type Shape, type Arrow, type DrawingPath } from '../stores/diagram'

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
      } else if (shape.type === 'circle') {
        const centerX = shape.x + shape.width / 2
        const centerY = shape.y + shape.height / 2
        const radiusX = shape.width / 2
        const radiusY = shape.height / 2
        const dx = (x - centerX) / radiusX
        const dy = (y - centerY) / radiusY
        if (dx * dx + dy * dy <= 1) {
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

  const getDrawingPathAtPoint = (x: number, y: number): DrawingPath | undefined => {
    // Check drawing paths in reverse order (most recently created first)
    for (let i = diagramStore.drawingPaths.length - 1; i >= 0; i--) {
      const path = diagramStore.drawingPaths[i]
      if (!path || !path.points || path.points.length === 0) continue
      
      // For selection purposes, use expanded bounding box with padding
      const padding = 15 // More generous padding for easier selection
      const minX = (path.minX || 0) - padding
      const maxX = (path.maxX || 0) + padding
      const minY = (path.minY || 0) - padding
      const maxY = (path.maxY || 0) + padding
      
      // First check if point is within expanded bounding box
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        // For paths within bounding box, do a line distance check with generous tolerance
        const tolerance = 20 // Very generous tolerance for selection
        
        for (let j = 0; j < path.points.length - 1; j++) {
          const point1 = path.points[j]
          const point2 = path.points[j + 1]
          if (point1 && point2) {
            const distance = distanceToLine(x, y, point1.x, point1.y, point2.x, point2.y)
            if (distance <= tolerance) {
              return path
            }
          }
        }
      }
    }
    return undefined
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
    getDrawingPathAtPoint,
    distanceToLine
  }
}