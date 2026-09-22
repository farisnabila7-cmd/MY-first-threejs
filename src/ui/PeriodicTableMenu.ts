import type { PeriodicTableElement } from '../domain/periodic-table/PeriodicTableElement'
import { PeriodicTableMenuHeader } from './periodic-table-menu/PeriodicTableMenuHeader'
// import { PeriodicTableMenuStatus } from './periodic-table-menu/PeriodicTableMenuStatus'
import { PeriodicTableMenuSelection } from './periodic-table-menu/PeriodicTableMenuSelection'
// import { PeriodicTableMenuControls } from './periodic-table-menu/PeriodicTableMenuControls'
import { PeriodicTableMenuLegend } from './periodic-table-menu/PeriodicTableMenuLegend'
import { PeriodicTableMenuActions } from './periodic-table-menu/PeriodicTableMenuActions'
import { PeriodicTableMenuToggle } from './PeriodicTableMenuToggle'

export class PeriodicTableMenu {
  readonly element: HTMLDivElement

  private readonly header: PeriodicTableMenuHeader
  // private readonly status: PeriodicTableMenuStatus
  private readonly selection: PeriodicTableMenuSelection
  // private readonly controls: PeriodicTableMenuControls
  private readonly legend: PeriodicTableMenuLegend
  private readonly actions: PeriodicTableMenuActions
  private readonly toggle: PeriodicTableMenuToggle

  private disposed = false

  constructor(container: HTMLElement, onResetView: () => void) {
    this.element = document.createElement('div')
    this.element.className = 'periodic-table-menu'

    this.header = new PeriodicTableMenuHeader()
    // this.status = new PeriodicTableMenuStatus()
    this.selection = new PeriodicTableMenuSelection()
    // this.controls = new PeriodicTableMenuControls()
    this.legend = new PeriodicTableMenuLegend()
    this.actions = new PeriodicTableMenuActions({ onResetView })

    this.element.append(
      createLayer('pt-header-layer', this.header.element),
      // createLayer('pt-status-layer', this.status.element),
      createLayer('pt-inspector-layer', this.selection.element),
      // createLayer('pt-controls-layer', this.controls.element),
      createLayer('pt-legend-layer', this.legend.element),
      createLayer('pt-action-layer', this.actions.element),
    )

    container.appendChild(this.element)

    this.toggle = new PeriodicTableMenuToggle({ target: this.element })
    container.appendChild(this.toggle.element)
  }

  setSelected(element: PeriodicTableElement | undefined): void {
    if (this.disposed) {
      return
    }
    this.selection.setSelected(element)
  }

  dispose(): void {
    if (this.disposed) {
      return
    }
    this.disposed = true

    this.toggle.dispose()
    this.actions.dispose()
    this.legend.dispose()
    // this.controls.dispose()
    this.selection.dispose()
    // this.status.dispose()
    this.header.dispose()

    this.element.remove()
  }
}

function createLayer(className: string, content: HTMLElement): HTMLDivElement {
  const layer = document.createElement('div')
  layer.className = className
  layer.appendChild(content)
  return layer
}
