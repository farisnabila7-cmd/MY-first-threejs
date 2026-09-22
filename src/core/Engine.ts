import {
  Color,
  PerspectiveCamera,
} from 'three'

import { Renderer } from '../rendering/Renderer'
import type { RendererStats } from '../rendering/Renderer'
import { Viewport } from './Viewport'
import { World } from '../scene/World'
import { RenderScheduler } from './RenderScheduler'
import {
  OrbitController,
} from '../interaction/OrbitController'

const CAMERA_FOV = 60
const CAMERA_NEAR = 0.1
const CAMERA_FAR = 1000

const SCENE_BACKGROUND = 0x0b1120

/**
 * Demand-driven engine.
 *
 * Rendering happens only when something asked for it
 * (requestRender) or while the camera is still settling
 * (OrbitControls damping). A static scene costs 0 frames.
 */
export class Engine {
  private readonly world: World
  private readonly camera: PerspectiveCamera
  private readonly renderer: Renderer
  private readonly viewport: Viewport
  private readonly scheduler: RenderScheduler
  private readonly orbitController: OrbitController
  private readonly resizeObserver: ResizeObserver

  private readonly cameraMovedListeners =
    new Set<() => void>()

  private cameraDirty = false
  private started = false
  private disposed = false

  /*
   * ResizeObserver runs right before paint. Resizing
   * clears the canvas, so we must draw in the same
   * callback, otherwise one blank frame flashes.
   */
  private readonly handleResize = (): void => {
    if (this.disposed) {
      return
    }

    this.resize()
    this.render()
  }

  private readonly handleContextRestored = (): void => {
    this.requestRender()
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

    this.scheduler =
      new RenderScheduler({
        frame: deltaTime => this.frame(deltaTime),
      })

    this.orbitController =
      new OrbitController(
        this.camera,
        this.renderer.domElement,
        {
          onStart: () => {
            this.requestRender()
          },

          onChange: () => {
            this.cameraDirty = true
            this.requestRender()
          },

          onEnd: () => {
            // Damping inertia continues after release.
            this.requestRender()
          },
        },
      )

    this.resize()

    this.resizeObserver =
      new ResizeObserver(this.handleResize)

    this.resizeObserver.observe(container)

    this.renderer.domElement.addEventListener(
      'webglcontextrestored',
      this.handleContextRestored,
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

  get stats(): RendererStats {
    return this.renderer.stats
  }

  start(): void {
    if (
      this.disposed ||
      this.started
    ) {
      return
    }

    this.started = true

    this.requestRender()
  }

  stop(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.started = false

    this.scheduler.cancel()
  }

  /**
   * The single entry point for "something visual
   * changed". Coalesced: call it as often as needed.
   */
  requestRender(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    this.scheduler.invalidate()
  }

  /**
   * Notified (before the frame renders) whenever the
   * camera actually moved: drag, wheel, inertia, reset.
   * Used to re-evaluate hover under a stationary pointer.
   */
  subscribeCameraMoved(
    listener: () => void,
  ): () => void {
    this.cameraMovedListeners.add(listener)

    return () => {
      this.cameraMovedListeners.delete(listener)
    }
  }

  resetView(): void {
    if (
      this.disposed ||
      !this.started
    ) {
      return
    }

    // reset() fires 'change', which marks the camera
    // dirty and schedules exactly one frame.
    this.orbitController.reset()
  }

  isAnimating(): boolean {
    return this.scheduler.isScheduled()
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.started = false

    this.resizeObserver.disconnect()

    this.renderer.domElement.removeEventListener(
      'webglcontextrestored',
      this.handleContextRestored,
    )

    this.cameraMovedListeners.clear()

    this.scheduler.dispose()
    this.orbitController.dispose()
    this.world.dispose()
    this.renderer.dispose()
  }

  /**
   * One frame = advance camera, let listeners react,
   * render ONCE. Returns true only while the camera
   * is still moving.
   */
  private frame(deltaTime: number): boolean {
    if (
      this.disposed ||
      !this.started
    ) {
      return false
    }

    const cameraMoving =
      this.orbitController.update(deltaTime)

    if (
      cameraMoving ||
      this.cameraDirty
    ) {
      this.cameraDirty = false

      this.notifyCameraMoved()
    }

    this.render()

    return cameraMoving
  }

  private notifyCameraMoved(): void {
    for (const listener of this.cameraMovedListeners) {
      listener()
    }
  }

  private render(): void {
    if (
      this.disposed ||
      !this.started
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
