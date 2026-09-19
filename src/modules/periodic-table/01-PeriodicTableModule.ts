import type { Camera, Group } from 'three'

import type { PeriodicTableElement } from '../../domain/periodic-table/PeriodicTableElement.ts'
import type { PeriodicTableCatalog } from '../../domain/periodic-table/PeriodicTableCatalog.ts'
import type { DisposableObject } from '../../scene/objects/DisposableObject.ts'

import { PeriodicTableLayout } from './02-PeriodicTableLayout.ts'
import { PeriodicTableView } from './03-PeriodicTableView.ts'
import { PeriodicTableInteraction } from './04-PeriodicTableInteraction.ts'
import { PeriodicTableVisual } from './07-PeriodicTableVisual.ts'

export class PeriodicTableModule implements DisposableObject {
  readonly object: Group

  private readonly view: PeriodicTableView
  private readonly interaction: PeriodicTableInteraction

  constructor(
    catalog: PeriodicTableCatalog,
    camera: Camera,
    element: HTMLElement,
    onSelect: (element: PeriodicTableElement) => void,
  ) {
    const layout = new PeriodicTableLayout()
    const visual = new PeriodicTableVisual()

    this.view = new PeriodicTableView(
      catalog,
      layout,
      visual,
    )

    this.object = this.view.object

    this.interaction = new PeriodicTableInteraction(
      camera,
      element,
      this.view,
      onSelect,
    )
  }

  clearSelection(): void {
    this.view.clearSelection()
  }

  dispose(): void {
    this.interaction.dispose()
    this.view.dispose()
  }
}