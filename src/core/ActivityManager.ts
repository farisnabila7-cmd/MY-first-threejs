const IDLE_TIMEOUT_MS =
  8 * 60 * 1000

const MAX_TIMEOUT_MS =
  2_147_483_647

export interface ActivityManagerListener {
  onActive(): void
  onIdle(): void
}

export class ActivityManager {
  private readonly listener:
    ActivityManagerListener

  private timeout:
    ReturnType<
      typeof globalThis.setTimeout
    > | null = null

  private lastActivityTime = 0

  private active = false
  private started = false
  private disposed = false

  private readonly handleActivity =
    (): void => {
      if (
        this.disposed ||
        !this.started
      ) {
        return
      }

      this.lastActivityTime = globalThis.performance.now()
      if (this.active) {
        return
      }
      this.active = true

      this.scheduleIdleCheck(
        IDLE_TIMEOUT_MS,
      )

      this.listener.onActive()
    }

  private readonly handleIdleCheck =
    (): void => {
      this.timeout = null

      if (
        this.disposed ||
        !this.started
      ) {
        return
      }

      const now =
        globalThis.performance.now()

      const elapsed =
        now -
        this.lastActivityTime
      if (
        elapsed <
        IDLE_TIMEOUT_MS
      ) {
        this.scheduleIdleCheck(
          IDLE_TIMEOUT_MS -
            elapsed,
        )

        return
      }
      if (!this.active) {
        return
      }
      this.active = false

      this.listener.onIdle()
    }

  constructor(
    listener: ActivityManagerListener,
  ) {
    this.listener = listener
  }

  start(): void {
    if (
      this.disposed ||
      this.started
    ) {
      return
    }

    this.started = true
    this.active = true

    this.lastActivityTime =
      globalThis.performance.now()

    this.addListeners()

    this.scheduleIdleCheck(
      IDLE_TIMEOUT_MS,
    )
    this.listener.onActive()
  }

  stop(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.started = false
    this.active = false

    this.removeListeners()
    this.clearIdleCheck()
  }

  notifyActivity(): void {
    this.handleActivity()
  }

  isActive(): boolean {
    return (
      this.started &&
      this.active
    )
  }

  isIdle(): boolean {
    return (
      this.started &&
      !this.active
    )
  }

  dispose(): void {
    if (this.disposed) {
      return
    }
    this.disposed = true
    this.started = false
    this.active = false

    this.removeListeners()
    this.clearIdleCheck()
  }

  private addListeners(): void {
    globalThis.addEventListener(
      'pointermove',
      this.handleActivity,
      {
        passive: true,
      },
    )

    globalThis.addEventListener(
      'pointerdown',
      this.handleActivity,
      {
        passive: true,
      },
    )

    globalThis.addEventListener(
      'wheel',
      this.handleActivity,
      {
        passive: true,
      },
    )

    globalThis.addEventListener(
      'keydown',
      this.handleActivity,
    )

    globalThis.addEventListener(
      'click',
      this.handleActivity,
      {
        passive: true,
      },
    )
  }

  private removeListeners(): void {
    globalThis.removeEventListener(
      'pointermove',
      this.handleActivity,
    )

    globalThis.removeEventListener(
      'pointerdown',
      this.handleActivity,
    )

    globalThis.removeEventListener(
      'wheel',
      this.handleActivity,
    )

    globalThis.removeEventListener(
      'keydown',
      this.handleActivity,
    )

    globalThis.removeEventListener(
      'click',
      this.handleActivity,
    )
  }

  private scheduleIdleCheck(
    delay: number,
  ): void {
    if (
      this.disposed ||
      !this.started ||
      this.timeout !== null
    ) {
      return
    }

    const safeDelay =
      Math.min(
        Math.max(delay, 0),
        MAX_TIMEOUT_MS,
      )

    this.timeout =
      globalThis.setTimeout(
        this.handleIdleCheck,
        safeDelay,
      )
  }

  private clearIdleCheck(): void {
    if (this.timeout === null) {
      return
    }

    globalThis.clearTimeout(
      this.timeout,
    )

    this.timeout = null
  }
}
