import type {
  PeriodicTableElement,
} from '../domain/periodic-table/PeriodicTableElement'

export class PeriodicTableMenu {
  private readonly root: HTMLDivElement
  private readonly selected: HTMLDivElement
  private readonly resetButton: HTMLButtonElement
  private readonly onResetView: () => void

  private disposed = false

  private readonly handleReset = (): void => {
    if (this.disposed) {
      return
    }

    this.onResetView()
  }

  constructor(
    container: HTMLElement,
    onResetView: () => void,
  ) {
    this.onResetView = onResetView

    this.root =
      document.createElement('div')

    this.root.className =
      'periodic-table-menu'

    this.root.innerHTML = `
      <div class="pt-header">
        <div>
          <div class="pt-eyebrow">
            ATOMIC EXPLORER
          </div>

          <div class="pt-title">
            Periodic Table
          </div>

          <div class="pt-subtitle">
            Interactive 3D learning module
          </div>
        </div>

        <div class="pt-live">
          <span class="pt-live-dot"></span>
          LIVE
        </div>
      </div>

      <div class="pt-divider"></div>

      <section class="pt-status">
        <div class="pt-section-label">
          MODULE
        </div>

        <div class="pt-status-row">
          <div class="pt-status-state">
            <span class="pt-ready-dot"></span>
            <span>Ready</span>
          </div>

          <div class="pt-count">
            <strong>118</strong>
            <span>elements</span>
          </div>
        </div>
      </section>

      <section class="pt-selected">
        <div class="pt-section-label">
          SELECTED ELEMENT
        </div>

        <div class="pt-selected-content">
          <div class="pt-empty-icon">+</div>

          <div>
            <div class="pt-empty-title">
              Select an element
            </div>

            <div class="pt-empty-text">
              Click any tile to inspect its details.
            </div>
          </div>
        </div>
      </section>

      <section class="pt-controls">
        <div class="pt-section-label">
          CONTROLS
        </div>

        <div class="pt-control-grid">
          <div class="pt-control">
            <span class="pt-control-key">
              LMB
            </span>
            <span>Orbit</span>
          </div>

          <div class="pt-control">
            <span class="pt-control-key">
              RMB
            </span>
            <span>Pan</span>
          </div>

          <div class="pt-control">
            <span class="pt-control-key">
              WHEEL
            </span>
            <span>Zoom</span>
          </div>

          <div class="pt-control">
            <span class="pt-control-key">
              CLICK
            </span>
            <span>Select</span>
          </div>
        </div>
      </section>

      <section class="pt-legend">
        <div class="pt-section-label">
          ELEMENT GROUPS
        </div>

        <div class="pt-legend-grid">
          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-alkali"></span>
            Alkali
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-alkaline"></span>
            Alkaline
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-transition"></span>
            Transition
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-post"></span>
            Post-transition
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-metalloid"></span>
            Metalloid
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-nonmetal"></span>
            Nonmetal
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-halogen"></span>
            Halogen
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-noble"></span>
            Noble gas
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-lanthanide"></span>
            Lanthanide
          </div>

          <div class="pt-legend-item">
            <span class="pt-legend-dot pt-actinide"></span>
            Actinide
          </div>
        </div>
      </section>
    `

    const selected =
      this.root.querySelector<HTMLDivElement>(
        '.pt-selected-content',
      )

    if (!selected) {
      throw new Error(
        'PeriodicTableMenu: selected element container tidak ditemukan',
      )
    }

    this.selected = selected

    this.resetButton =
      document.createElement('button')

    this.resetButton.type =
      'button'

    this.resetButton.className =
      'pt-reset'

    this.resetButton.innerHTML = `
      <span>
        Reset View
      </span>

      <span class="pt-reset-icon">
        ↺
      </span>
    `

    this.resetButton.addEventListener(
      'click',
      this.handleReset,
    )

    this.root.appendChild(
      this.resetButton,
    )

    container.appendChild(
      this.root,
    )
  }

  setSelected(
    element: PeriodicTableElement | undefined,
  ): void {
    if (this.disposed) {
      return
    }

    if (!element) {
      this.selected.innerHTML = `
        <div class="pt-empty-icon">
          +
        </div>

        <div>
          <div class="pt-empty-title">
            Select an element
          </div>

          <div class="pt-empty-text">
            Click any tile to inspect its details.
          </div>
        </div>
      `

      return
    }

    this.selected.innerHTML = `
      <div class="pt-element-symbol">
        ${element.symbol}
      </div>

      <div class="pt-element-info">
        <div class="pt-element-name">
          ${element.name}
        </div>

        <div class="pt-element-meta">
          Atomic number
          <strong>
            ${String(element.atomicNumber)}
          </strong>
        </div>

        <div class="pt-element-meta">
          Period
          <strong>
            ${String(element.position.period)}
          </strong>
        </div>
      </div>
    `
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true

    this.resetButton.removeEventListener(
      'click',
      this.handleReset,
    )

    this.root.remove()
  }
}