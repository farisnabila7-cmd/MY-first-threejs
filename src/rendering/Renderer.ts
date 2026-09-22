import type { Camera, Scene } from 'three'
import { SRGBColorSpace, WebGLRenderer } from 'three'

const MAX_PIXEL_RATIO = 2

export interface RendererStats {
  readonly frames: number
  readonly drawCalls: number
  readonly triangles: number
  readonly geometries: number
  readonly textures: number
}

export class Renderer {
  private readonly renderer: WebGLRenderer
  private frames = 0
  private disposed = false

  constructor(container: HTMLElement) {
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, MAX_PIXEL_RATIO))
    container.appendChild(this.renderer.domElement)
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  get stats(): RendererStats {
    const { info } = this.renderer
    return {
      frames: this.frames,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    }
  }

  render(scene: Scene, camera: Camera): void {
    if (this.disposed) return
    this.frames += 1
    this.renderer.render(scene, camera)
  }

  resize(width: number, height: number): void {
    if (this.disposed) return
    this.renderer.setSize(width, height, false)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.renderer.dispose()
    this.renderer.forceContextLoss()

    const canvas = this.renderer.domElement
    if (canvas.parentElement) {
      canvas.remove()
    }
  }
}
