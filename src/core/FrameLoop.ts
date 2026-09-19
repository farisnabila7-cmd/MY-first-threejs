const MAX_DELTA_TIME = 0.1

export interface FrameLoopListener {
  /**
   * Executes one frame of work.
   *
   * Return true when another frame is required.
   * Return false when the current demand is complete.
   */
  update(deltaTime: number): boolean
}

export class FrameLoop {
  private readonly listener: FrameLoopListener

  private frame: number | null = null
  private lastTime: number | null = null
  private disposed = false

  private readonly animate = (
    currentTime: number,
  ): void => {
    this.frame = null

    if (this.disposed) {
      return
    }

    let deltaTime = 0

    if (this.lastTime !== null) {
      deltaTime =
        (currentTime - this.lastTime) /
        1000

      if (
        deltaTime >
        MAX_DELTA_TIME
      ) {
        deltaTime = MAX_DELTA_TIME
      }
    }

    this.lastTime = currentTime

    const keepRunning =
      this.listener.update(
        deltaTime,
      )

    if (!keepRunning) {
      this.lastTime = null
      return
    }

    this.frame =
      globalThis.requestAnimationFrame(
        this.animate,
      )
  }

  constructor(
    listener: FrameLoopListener,
  ) {
    this.listener = listener
  }

  start(): void {
    if (
      this.disposed ||
      this.frame !== null
    ) {
      return
    }

    this.lastTime = null

    this.frame =
      globalThis.requestAnimationFrame(
        this.animate,
      )
  }

  stop(): void {
    if (this.frame !== null) {
      globalThis.cancelAnimationFrame(
        this.frame,
      )
    }

    this.frame = null
    this.lastTime = null
  }

  isRunning(): boolean {
    return this.frame !== null
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.stop()
    this.disposed = true
  }
}