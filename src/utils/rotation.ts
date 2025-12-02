export function rotatePoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  angleDegrees: number
): { x: number; y: number } {
  const angleRadians = (angleDegrees * Math.PI) / 180
  const dx = x - centerX
  const dy = y - centerY

  const rotatedX = dx * Math.cos(angleRadians) - dy * Math.sin(angleRadians)
  const rotatedY = dx * Math.sin(angleRadians) + dy * Math.cos(angleRadians)

  return {
    x: rotatedX + centerX,
    y: rotatedY + centerY
  }
}

export function normalizeRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360
}

export function calculateAngleBetweenPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
}

