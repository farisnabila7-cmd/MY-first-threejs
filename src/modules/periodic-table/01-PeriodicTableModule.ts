import type {
  Camera,
  Group,
} from 'three'

import type {
  PeriodicTableElement,
} from '../../domain/periodic-table/PeriodicTableElement'

import type {
  PeriodicTableCatalog,
} from '../../domain/periodic-table/PeriodicTableCatalog.ts'

import type {
  DisposableObject,
} from '../../scene/objects/DisposableObject.ts'

import {
  PeriodicTableLayout,
} from './02-PeriodicTableLayout.ts'

import {
  PeriodicTableView,
} from './03-PeriodicTableView.ts'

import {
  PeriodicTableInteraction,
} from './04-PeriodicTableInteraction.ts'

import {
  PeriodicTableVisual,
} from './07-PeriodicTableVisual.ts'

export interface PeriodicTableModuleOptions {
  readonly catalog:
    PeriodicTableCatalog

  readonly camera:
    Camera

  readonly element:
    HTMLElement

  readonly onSelect:
    (
      element: PeriodicTableElement,
    ) => void

  /**
   * Ask the engine for one
   * coalesced frame.
   */
  readonly requestRender:
    () => void

  /**
   * Subscribe to camera movement.
   *
   * Returns the unsubscribe function.
   */
  readonly subscribeCameraMoved:
    (
      listener: () => void,
    ) => () => void
}

export class PeriodicTableModule
  implements DisposableObject {
  readonly object: Group

  private readonly view:
    PeriodicTableView

  private readonly interaction:
    PeriodicTableInteraction

  private readonly requestRender:
    () => void

  private readonly unsubscribeCameraMoved:
    () => void

  constructor(
    options:
      PeriodicTableModuleOptions,
  ) {
    this.requestRender =
      options.requestRender

    this.view =
      new PeriodicTableView(
        options.catalog,
        new PeriodicTableLayout(),
        new PeriodicTableVisual(),
      )

    this.object =
      this.view.object

    this.interaction =
      new PeriodicTableInteraction({
        camera:
          options.camera,

        element:
          options.element,

        view:
          this.view,

        onSelect:
          options.onSelect,

        requestRender:
          options.requestRender,
      })

    this.unsubscribeCameraMoved =
      options.subscribeCameraMoved(
        this.interaction
          .handleCameraMoved,
      )
  }

  clearSelection(): void {
    this.view.clearSelection()

    this.requestRender()
  }

  dispose(): void {
    this.unsubscribeCameraMoved()

    this.interaction.dispose()

    this.view.dispose()
  }
}