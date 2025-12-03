import type { Shape, Arrow, DrawingPath } from '../stores/diagram'

export interface DiagramData {
  shapes: Shape[]
  arrows: Arrow[]
  drawingPaths: DrawingPath[]
}

export function encodeDiagramToUrl(data: DiagramData): string {
  try {
    const json = JSON.stringify(data)
    const base64 = btoa(encodeURIComponent(json))
    const url = `${window.location.origin}${window.location.pathname}#${base64}`
    return url
  } catch (error) {
    console.error('Failed to encode diagram:', error)
    throw new Error('Failed to generate shareable link')
  }
}

export function decodeDiagramFromUrl(): DiagramData | null {
  try {
    const hash = window.location.hash.slice(1)
    if (!hash) return null
    
    const json = decodeURIComponent(atob(hash))
    const data = JSON.parse(json) as DiagramData
    
    if (data.shapes && data.arrows && data.drawingPaths) {
      return data
    }
    return null
  } catch (error) {
    console.error('Failed to decode diagram from URL:', error)
    return null
  }
}

export function clearUrlHash() {
  window.history.replaceState(null, '', window.location.pathname)
}

