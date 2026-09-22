interface LegendDefinition {
  readonly className: string
  readonly label: string
}

const LEGEND: readonly LegendDefinition[] = [
  { className: 'pt-alkali', label: 'Alkali' },
  { className: 'pt-alkaline', label: 'Alkaline' },
  { className: 'pt-transition', label: 'Transition' },
  { className: 'pt-post', label: 'Post-transition' },
  { className: 'pt-metalloid', label: 'Metalloid' },
  { className: 'pt-nonmetal', label: 'Nonmetal' },
  { className: 'pt-halogen', label: 'Halogen' },
  { className: 'pt-noble', label: 'Noble gas' },
  { className: 'pt-lanthanide', label: 'Lanthanide' },
  { className: 'pt-actinide', label: 'Actinide' },
]

export class PeriodicTableMenuLegend {
  readonly element: HTMLElement

  private disposed = false

  constructor() {
    const root = document.createElement('section')
    root.className = 'pt-legend'

    const label = document.createElement('div')
    label.className = 'pt-section-label'
    label.textContent = 'ELEMENT GROUPS'

    const grid = document.createElement('div')
    grid.className = 'pt-legend-grid'

    for (const item of LEGEND) {
      grid.appendChild(createLegendItem(item))
    }

    root.append(label, grid)

    this.element = root
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.element.remove()
  }
}

function createLegendItem(
  item: LegendDefinition,
): HTMLElement {
  const root = document.createElement('div')
  root.className = 'pt-legend-item'

  const dot = document.createElement('span')
  dot.classList.add(
    'pt-legend-dot',
    item.className,
  )

  const label = document.createTextNode(
    item.label,
  )

  root.append(dot, label)

  return root
}