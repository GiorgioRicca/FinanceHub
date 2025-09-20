import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'


beforeAll(() => server.listen())



afterEach(() => server.resetHandlers())


afterAll(() => server.close())


global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  
  observe() {
    return null
  }
  
  disconnect() {
    return null
  }
  
  unobserve() {
    return null
  }
} as any


global.ResizeObserver = class ResizeObserver {
  constructor() {}
  
  observe() {
    return null
  }
  
  disconnect() {
    return null
  }
  
  unobserve() {
    return null
  }
} as any


HTMLCanvasElement.prototype.getContext = (): CanvasRenderingContext2D | null => {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  } as any
}