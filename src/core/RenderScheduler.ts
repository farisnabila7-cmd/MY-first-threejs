import type { Camera } from 'three'
import { Plane, Ray, Vector3 } from 'three'
import type { PeriodicTableElement } from '../../domain/periodic-table/PeriodicTableElement'
import type { PeriodicTableView } from './03-PeriodicTableView'

const DRAG_THRESHOLD_SQUARED = 25

type PointerPhase = 'idle' | 'pressed' | 'navigating'

export interface PeriodicTableInteractionOptions {
  readonly camera: Camera
  readonly element: HTMLElement
  readonly view: PeriodicTableView
  readonly onSelect: (element: PeriodicTableElement) => void
  readonly requestRender: () => void
}

export class PeriodicTableInteraction {
  private readonly camera: Camera
  private readonly element: HTMLElement
  private readonly view: PeriodicTableView
  private readonly onSelect: (element: PeriodicTableElement) => void
  private readonly requestRender: () => void
  private readonly ray = new Ray()
  private readonly tablePlane = new Plane(new Vector3(0, 0, 1), 0)
  private readonly worldPoint = new Vector3()

  private phase: PointerPhase = 'idle'
  private pressPointerId: number | null = null
  private pressButton = 0
  private pressX = 0
  private pressY = 0
  private pointerX = 0
  private pointerY = 0
  private hasPointer = false
  private hoverCapable = true
  private cursor = ''
  private disposed = false

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.disposed || !event.isPrimary) {
      return
    }
    this.phase = 'pressed'
    this.pressPointerId = event.pointerId
    this.pressButton = event.button
    this.pressX = event.clientX
    this.pressY = event.clientY
    this.trackPointer(event)
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.disposed) {
      return
    }
    if (this.phase !== 'idle' && event.pointerId !== this.pressPointerId) {
      return
    }
    this.trackPointer(event)
    if (this.phase === 'pressed') {
      this.promoteIfDragging(event)
      return
    }
    if (this.phase === 'idle') {
      this.refreshHover()
    }
  }

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.disposed || event.pointerId !== this.pressPointerId) {
      return
    }
    const isClick = this.phase === 'pressed' && this.pressButton === 0 && event.button === 0
    this.phase = 'idle'
    this.pressPointerId = null
    this.trackPointer(event)
    if (isClick) {
      this.selectAtPointer()
    }
    this.refreshHover()
    this.updateCursor()
  }

  private readonly handlePointerCancel = (): void => {
    this.abortGesture()
  }

  private readonly handleLostCapture = (): void => {
    if (this.phase !== 'idle') {
      this.abortGesture()
    }
  }

  private readonly handlePointerLeave = (): void => {
    if (this.disposed) {
      return
    }
    this.hasPointer = false
    if (this.phase === 'idle') {
      this.clearHover()
    }
  }

  readonly handleCameraMoved = (): void => {
    if (this.disposed || this.phase !== 'idle') {
      return
    }
    this.refreshHover()
  }

  constructor(options: PeriodicTableInteractionOptions) {
    this.camera = options.camera
    this.element = options.element
    this.view = options.view
    this.onSelect = options.onSelect
    this.requestRender = options.requestRender
    this.element.addEventListener('pointerdown', this.handlePointerDown)
    this.element.addEventListener('pointerup', this.handlePointerUp)
    this.element.addEventListener('pointermove', this.handlePointerMove)
    this.element.addEventListener('pointerleave', this.handlePointerLeave)
    this.element.addEventListener('pointercancel', this.handlePointerCancel)
    this.element.addEventListener('lostpointercapture', this.handleLostCapture)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.element.removeEventListener('pointerdown', this.handlePointerDown)
    this.element.removeEventListener('pointerup', this.handlePointerUp)
    this.element.removeEventListener('pointermove', this.handlePointerMove)
    this.element.removeEventListener('pointerleave', this.handlePointerLeave)
    this.element.removeEventListener('pointercancel', this.handlePointerCancel)
    this.element.removeEventListener('lostpointercapture', this.handleLostCapture)
    this.element.style.cursor = ''
    this.phase = 'idle'
    this.pressPointerId = null
    this.hasPointer = false
  }

  private trackPointer(event: PointerEvent): void {
    this.pointerX = event.offsetX
    this.pointerY = event.offsetY
    this.hasPointer = true
    this.hoverCapable = event.pointerType !== 'touch'
  }

  private promoteIfDragging(event: PointerEvent): void {
    const deltaX = event.clientX - this.pressX
    const deltaY = event.clientY - this.pressY
    const movedSquared = (deltaX * deltaX) + (deltaY * deltaY)
    if (movedSquared <= DRAG_THRESHOLD_SQUARED) {
      return
    }
    this.phase = 'navigating'
    this.clearHover()
    this.updateCursor()
  }

  private abortGesture(): void {
    if (this.disposed) return
    this.phase = 'idle'
    this.pressPointerId = null
    this.clearHover()
    this.updateCursor()
  }

  private refreshHover(): void {
    if (!this.hasPointer || !this.hoverCapable) {
      return
    }
    if (this.view.setHovered(this.pickAtPointer())) {
      this.requestRender()
    }
    this.updateCursor()
  }

  private clearHover(): void {
    if (this.view.setHovered(null)) {
      this.requestRender()
    }
    this.updateCursor()
  }

  private selectAtPointer(): void {
    const id = this.pickAtPointer()
    if (id === null) return
    const element = this.view.getElement(id)
    if (!element) return
    if (this.view.setSelected(id)) {
      this.requestRender()
    }
    this.onSelect(element)
  }

  private updateCursor(): void {
    const next = this.resolveCursor()
    if (next === this.cursor) return
    this.cursor = next
    this.element.style.cursor = next
  }

  private resolveCursor(): string {
    if (this.phase === 'navigating') {
      return 'grabbing'
    }
    if (this.view.hoveredTileId !== null) {
      return 'pointer'
    }
    return ''
  }

  private pickAtPointer(): number | null {
    const width = this.element.clientWidth
    const height = this.element.clientHeight
    if (width <= 0 || height <= 0) {
      return null
    }

    this.camera.updateMatrixWorld()

    const ndcX = ((this.pointerX / width) * 2) - 1
    const ndcY = 1 - ((this.pointerY / height) * 2)

    this.ray.origin.setFromMatrixPosition(this.camera.matrixWorld)
    this.ray.direction
      .set(ndcX, ndcY, 0.5)
      .unproject(this.camera)
      .sub(this.ray.origin)
      .normalize()

    const faceZ = this.view.frontFaceZ
    const seesFront = this.ray.origin.z >= 0

    if (seesFront) {
      this.tablePlane.constant = -faceZ
    } else {
      this.tablePlane.constant = faceZ
    }

    const hit = this.ray.intersectPlane(this.tablePlane, this.worldPoint)
    if (!hit) {
      return null
    }

    return this.view.pick(hit.x, hit.y)
  }
}
