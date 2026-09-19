import type {
  PerspectiveCamera,
} from 'three'

import {
  OrbitControls,
} from 'three/addons/controls/OrbitControls.js'

const INITIAL_CAMERA_DISTANCE = 24

const MIN_DISTANCE = 8
const MAX_DISTANCE = 40

const MIN_POLAR_ANGLE = 0.25
const MAX_POLAR_ANGLE =
  Math.PI - 0.25

const DAMPING_FACTOR = 0.08

export interface OrbitControllerListener {
  onStart(): void
  onChange(): void
  onEnd(): void
}

export class OrbitController {
  private readonly controls: OrbitControls

  private readonly listener:
    OrbitControllerListener | null

  private disposed = false

  private readonly handleStart =
    (): void => {
      if (this.disposed) {
        return
      }

      this.listener?.onStart()
    }

  private readonly handleChange =
    (): void => {
      if (this.disposed) {
        return
      }

      this.listener?.onChange()
    }

  private readonly handleEnd =
    (): void => {
      if (this.disposed) {
        return
      }

      this.listener?.onEnd()
    }

  constructor(
    camera: PerspectiveCamera,
    element: HTMLElement,
    listener:
      OrbitControllerListener | null = null,
  ) {
    this.listener = listener

    this.controls =
      new OrbitControls(
        camera,
        element,
      )

    this.configureControls()

    camera.position.set(
      0,
      0,
      INITIAL_CAMERA_DISTANCE,
    )

    this.bindEvents()

    this.controls.update()
    this.controls.saveState()
  }

  /**
   * Advances OrbitControls by one frame.
   *
   * Returns true when the controls still have
   * visual work to perform.
   *
   * Returns false when the camera/control state
   * has become stable and another frame is not
   * required by OrbitControls.
   */
  update(
    deltaTime: number,
  ): boolean {
    if (this.disposed) {
      return false
    }

    return this.controls.update(
      deltaTime,
    )
  }

  reset(): void {
    if (this.disposed) {
      return
    }

    this.controls.reset()
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true

    this.unbindEvents()

    this.controls.dispose()
  }

  private configureControls(): void {
    this.controls.enableDamping = true

    this.controls.dampingFactor =
      DAMPING_FACTOR

    this.controls.enablePan = true

    this.controls.minDistance =
      MIN_DISTANCE

    this.controls.maxDistance =
      MAX_DISTANCE

    this.controls.minPolarAngle =
      MIN_POLAR_ANGLE

    this.controls.maxPolarAngle =
      MAX_POLAR_ANGLE

    this.controls.target.set(
      0,
      0,
      0,
    )
  }

  private bindEvents(): void {
    this.controls.addEventListener(
      'start',
      this.handleStart,
    )

    this.controls.addEventListener(
      'change',
      this.handleChange,
    )

    this.controls.addEventListener(
      'end',
      this.handleEnd,
    )
  }

  private unbindEvents(): void {
    this.controls.removeEventListener(
      'start',
      this.handleStart,
    )

    this.controls.removeEventListener(
      'change',
      this.handleChange,
    )

    this.controls.removeEventListener(
      'end',
      this.handleEnd,
    )
  }
}