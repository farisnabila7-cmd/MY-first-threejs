import type { Camera, Object3D } from 'three';
import { Plane, Ray, Vector2, Vector3 } from 'three';
import type { PeriodicTableElement } from '../../domain/periodic-table/PeriodicTableElement';
import type { PeriodicTableView } from './03-PeriodicTableView';

const MAX_CLICK_MOVEMENT_SQUARED = 25;

export class PeriodicTableInteraction {
  private readonly camera: Camera;
  private readonly element: HTMLElement;
  private readonly view: PeriodicTableView;
  private readonly onSelect: (element: PeriodicTableElement) => void;

  /**
   * Persistent math objects.
   * Reused for every interaction.
   */
  private readonly pointer = new Vector2();
  private readonly ray = new Ray();
  private readonly tablePlane = new Plane(new Vector3(0, 0, 1), 0);
  private readonly worldPoint = new Vector3();

  /**
   * Cached DOM bounds.
   */
  private boundsLeft = 0;
  private boundsTop = 0;
  private boundsWidth = 0;
  private boundsHeight = 0;

  /**
   * Click tracking.
   */
  private pointerDownX = 0;
  private pointerDownY = 0;
  private hasPointerDown = false;

  /**
   * Pointer hover state.
   */
  private pointerX = 0;
  private pointerY = 0;
  private pointerDirty = false;
  private hoverFrameRequested = false;
  private hoverFrame: number | null = null;
  private hoveredObject: Object3D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.disposed || event.button !== 0) {
      return;
    }
    this.pointerDownX = event.clientX;
    this.pointerDownY = event.clientY;
    this.hasPointerDown = true;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.disposed || event.button !== 0) {
      return;
    }
    if (!this.hasPointerDown) {
      return;
    }

    const deltaX = event.clientX - this.pointerDownX;
    const deltaY = event.clientY - this.pointerDownY;
    this.hasPointerDown = false;

    const movement = (deltaX * deltaX) + (deltaY * deltaY);
    if (movement > MAX_CLICK_MOVEMENT_SQUARED) {
      return;
    }

    this.selectAt(event.clientX, event.clientY);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.disposed) {
      return;
    }
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.pointerDirty = true;
    this.requestHoverFrame();
  };

  private readonly handlePointerLeave = (): void => {
    if (this.disposed) {
      return;
    }
    this.pointerDirty = false;
    if (!this.hoveredObject) {
      return;
    }
    this.hoveredObject = null;
    this.view.setHovered(null);
  };

  private readonly processHoverFrame = (): void => {
    this.hoverFrame = null;
    this.hoverFrameRequested = false;

    if (this.disposed || !this.pointerDirty) {
      return;
    }
    this.pointerDirty = false;
    this.hoverAt(this.pointerX, this.pointerY);
  };

  private readonly handleResize = (): void => {
    if (this.disposed) {
      return;
    }
    this.refreshBounds();
  };

  constructor(
    camera: Camera,
    element: HTMLElement,
    view: PeriodicTableView,
    onSelect: (element: PeriodicTableElement) => void,
  ) {
    this.camera = camera;
    this.element = element;
    this.view = view;
    this.onSelect = onSelect;

    this.refreshBounds();

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.element);

    this.element.addEventListener('pointerdown', this.handlePointerDown);
    this.element.addEventListener('pointerup', this.handlePointerUp);
    this.element.addEventListener('pointermove', this.handlePointerMove);
    this.element.addEventListener('pointerleave', this.handlePointerLeave);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;

    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerleave', this.handlePointerLeave);

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.hoverFrame !== null) {
      cancelAnimationFrame(this.hoverFrame);
      this.hoverFrame = null;
    }

    this.pointerDirty = false;
    this.hoverFrameRequested = false;
    this.hasPointerDown = false;
    this.hoveredObject = null;
  }

  private requestHoverFrame(): void {
    if (this.disposed || this.hoverFrameRequested) {
      return;
    }
    this.hoverFrameRequested = true;
    this.hoverFrame = requestAnimationFrame(this.processHoverFrame);
  }

  private refreshBounds(): void {
    const bounds = this.element.getBoundingClientRect();
    this.boundsLeft = bounds.left;
    this.boundsTop = bounds.top;
    this.boundsWidth = bounds.width;
    this.boundsHeight = bounds.height;
  }

  private selectAt(clientX: number, clientY: number): void {
    const mesh = this.getMeshAtPointer(clientX, clientY);
    if (!mesh) {
      return;
    }

    const element = this.view.getElement(mesh);
    if (!element) {
      return;
    }

    this.view.setSelected(mesh);
    this.onSelect(element);
  }

  private hoverAt(clientX: number, clientY: number): void {
    const mesh = this.getMeshAtPointer(clientX, clientY);
    if (!mesh) {
      if (!this.hoveredObject) {
        return;
      }
      this.hoveredObject = null;
      this.view.setHovered(null);
      return;
    }

    if (this.hoveredObject === mesh) {
      return;
    }

    this.hoveredObject = mesh;
    this.view.setHovered(mesh);
  }

  private getMeshAtPointer(clientX: number, clientY: number): Object3D | null {
    const { boundsLeft, boundsTop, boundsWidth, boundsHeight } = this;
    if (boundsWidth <= 0 || boundsHeight <= 0) {
      return null;
    }

    // Ditambahkan tanda kurung ekstra untuk memisahkan perkalian (*) dan pengurangan (-)
    this.pointer.x = (((clientX - boundsLeft) / boundsWidth) * 2) - 1;
    this.pointer.y = -((((clientY - boundsTop) / boundsHeight) * 2) - 1);

    this.ray.origin.setFromMatrixPosition(this.camera.matrixWorld);
    this.ray.direction
      .set(this.pointer.x, this.pointer.y, 0.5)
      .unproject(this.camera)
      .sub(this.ray.origin)
      .normalize();

    const intersection = this.ray.intersectPlane(this.tablePlane, this.worldPoint);
    if (!intersection) {
      return null;
    }

    return this.view.getMeshAtWorldPosition(this.worldPoint.x, this.worldPoint.y);
  }
}