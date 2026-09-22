const MAX_DELTA_TIME = 0.1

export interface RenderSchedulerListener {
  /**
   * Runs exactly once per scheduled frame.
   *
   * Return true ONLY when the next frame is needed
   * because something is still in motion (camera
   * damping, an animation). Return false when the
   * scene has settled: the loop then goes fully
   * dormant until invalidate() is called again.
   */
  frame(deltaTime: number): boolean
}

/**
 * Demand-driven frame scheduler.
 *
 * The only place in the app allowed to call
 * requestAnimationFrame. No timers, no idle watchdogs:
 * if nothing invalidates, nothing runs.
 */
export class RenderScheduler {
  private readonly listener: RenderSchedulerListener

  private handle: number | null = null
  private lastTime: number | null = null
  private ticking = false
  private disposed = false

  private readonly tick =
    (time: number): void => {
      this.handle = null

      if (this.disposed) {
        return
      }

      const deltaTime =
        this.computeDelta(time)

      this.lastTime = time
      this.ticking = true

      let needsAnotherFrame: boolean

      try {
        needsAnotherFrame =
          this.listener.frame(
            deltaTime,
          )
      } finally {
        this.ticking = false
      }

      if (needsAnotherFrame) {
        this.handle =
          globalThis.requestAnimationFrame(
            this.tick,
          )

        return
      }

      this.lastTime = null
    }

  constructor(
    listener: RenderSchedulerListener,
  ) {
    this.listener = listener
  }

  /**
   * Request one frame.
   *
   * Calls are coalesced into a single rAF.
   *
   * Calls made while frame() is executing are
   * intentionally ignored. The current frame will
   * already render after its camera/update hooks.
   */
  invalidate(): void {
    if (
      this.disposed ||
      this.ticking ||
      this.handle !== null
    ) {
      return
    }

    this.handle =
      globalThis.requestAnimationFrame(
        this.tick,
      )
  }

  isScheduled(): boolean {
    return this.handle !== null
  }

  cancel(): void {
    if (this.handle !== null) {
      globalThis.cancelAnimationFrame(
        this.handle,
      )
    }

    this.handle = null
    this.lastTime = null
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.cancel()
    this.disposed = true
  }

  private computeDelta(
    time: number,
  ): number {
    if (this.lastTime === null) {
      return 0
    }

    return Math.min(
      (time - this.lastTime) / 1000,
      MAX_DELTA_TIME,
    )
  }
}