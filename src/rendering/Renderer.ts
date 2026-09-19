import type {
  Camera,
  Scene,
} from 'three'

import {
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'

const MAX_PIXEL_RATIO = 2

export class Renderer {
  private readonly renderer:
    WebGLRenderer

  private disposed = false

  constructor(
    container: HTMLElement,
  ) {
    this.renderer =
      new WebGLRenderer({
        antialias: true,
      })

    this.renderer.outputColorSpace =
      SRGBColorSpace

    this.renderer.setPixelRatio(
      Math.min(
        globalThis.devicePixelRatio,
        MAX_PIXEL_RATIO,
      ),
    )

    container.appendChild(
      this.renderer.domElement,
    )
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  render(
    scene: Scene,
    camera: Camera,
  ): void {
    if (this.disposed) {
      return
    }

    this.renderer.render(
      scene,
      camera,
    )
  }

  resize(
    width: number,
    height: number,
  ): void {
    if (this.disposed) {
      return
    }

    this.renderer.setSize(
      width,
      height,
      false,
    )
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true

    this.renderer.dispose()

    const canvas =
      this.renderer.domElement

    if (canvas.parentElement) {
      canvas.remove()
    }
  }
}