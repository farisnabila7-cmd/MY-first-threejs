export interface ViewportSize {
  readonly width: number
  readonly height: number
}

export class Viewport {
  private readonly container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
  }

  get size(): ViewportSize {
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }
  }

  get aspectRatio(): number {
    const { width, height } = this.size

    return width / Math.max(height, 1)
  }
}