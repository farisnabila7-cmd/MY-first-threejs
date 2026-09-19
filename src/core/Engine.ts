import {
  Color,
  PerspectiveCamera,
} from 'three'

import { Renderer } from '../rendering/Renderer'
import { Viewport } from './Viewport'
import { World } from '../scene/World'
import { FrameLoop } from './FrameLoop'
import {
  ActivityManager,
} from './ActivityManager'
import {
  OrbitController,
} from '../interaction/OrbitController'

const CAMERA_FOV = 60
const CAMERA_NEAR = 0.1
const CAMERA_FAR = 1000

const SCENE_BACKGROUND = 0x0b1120

export class Engine {
  private readonly world: World
  private readonly camera: PerspectiveCamera
  private readonly renderer: Renderer
  private readonly viewport: Viewport

  private readonly frameLoop: FrameLoop
  private readonly activityManager: ActivityManager
  private readonly orbitController: OrbitController

  private started = false
  private disposed = false

  private readonly handleResize = (): void => {
    if (this.disposed) {
      return
    }

    this.resize()

    if (
      this.started &&
      this.activityManager.isActive()
    ) {
      this.render()
    }
  }

  constructor(container: HTMLElement) {
    this.world = new World()

    this.world.scene.background =
      new Color(SCENE_BACKGROUND)

    this.camera =
      new PerspectiveCamera(
        CAMERA_FOV,
        1,
        CAMERA_NEAR,
        CAMERA_FAR,
      )

    this.renderer =
      new Renderer(container)

    this.viewport =
      new Viewport(container)

    this.orbitController =
      new OrbitController(
        this.camera,
        this.renderer.domElement,
        {
          onStart: () => {
            this.handleOrbitStart()
          },

          onChange: () => {
            this.handleOrbitChange()
          },

          onEnd: () => {
            this.handleOrbitEnd()
          },
        },
      )

    this.frameLoop =
    new FrameLoop({
    update: deltaTime => {
      if (
        !this.started ||
        this.activityManager.isIdle()
      ) {
        return false
      }

      this.orbitController.update(
        deltaTime,
      )

      this.render()

      return true
    },
  })

    this.activityManager =
      new ActivityManager({
        onActive: () => {
          if (
            !this.started ||
            this.disposed
          ) {
            return
          }

          this.render()
        },

        onIdle: () => {
          this.frameLoop.stop()
        },
      })

    this.resize()

    globalThis.addEventListener(
      'resize',
      this.handleResize,
    )
  }

  get sceneWorld(): World {
    return this.world
  }

  get cameraObject(): PerspectiveCamera {
    return this.camera
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  start(): void {
    if (
      this.disposed ||
      this.started
    ) {
      return
    }

    this.started = true

    this.activityManager.start()

    this.render()
  }

  stop(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.started = false

    this.frameLoop.stop()
    this.activityManager.stop()
  }

  wake(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.activityManager.notifyActivity()
  }

  resetView(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.wake()
    this.orbitController.reset()

    this.render()
  }

  renderNow(): void {
    if (
      this.disposed ||
      !this.started ||
      this.activityManager.isIdle()
    ) {
      return
    }

    this.render()
  }

  startMotion(): void {
    if (
      this.disposed ||
      !this.started ||
      this.activityManager.isIdle()
    ) {
      return
    }

    this.frameLoop.start()
  }

  stopMotion(): void {
    this.frameLoop.stop()
  }

  isRunning(): boolean {
    return this.started
  }

  isActive(): boolean {
    return this.activityManager.isActive()
  }

  isIdle(): boolean {
    return this.activityManager.isIdle()
  }

  isAnimating(): boolean {
    return this.frameLoop.isRunning()
  }

  dispose(): void {
  if (this.disposed) {
    return
  }

  this.disposed = true
  this.started = false

    globalThis.removeEventListener(
      'resize',
    this.handleResize,
    )
    this.frameLoop.dispose()
    this.activityManager.dispose()
    this.orbitController.dispose()
    this.world.dispose()
    this.renderer.dispose()
  }

  private handleOrbitStart(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.wake()
    this.frameLoop.start()
  }

  private handleOrbitChange(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.wake()
    this.render()
  }

  private handleOrbitEnd(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.wake()
  }

  private render(): void {
    if (
      this.disposed ||
      !this.started ||
      this.activityManager.isIdle()
    ) {
      return
    }

    this.renderer.render(
      this.world.scene,
      this.camera,
    )
  }

  private resize(): void {
    const {
      width,
      height,
    } = this.viewport.size

    this.camera.aspect =
      this.viewport.aspectRatio

    this.camera.updateProjectionMatrix()

    this.renderer.resize(
      width,
      height,
    )
  }
}