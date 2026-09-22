import type { PeriodicTableElement } from '../../domain/periodic-table/PeriodicTableElement'

interface DetailNodes {
  readonly nodes: readonly HTMLElement[]
  readonly symbol: HTMLDivElement
  readonly name: HTMLDivElement
  readonly number: HTMLElement
  readonly period: HTMLElement
}

export class PeriodicTableMenuSelection {
  readonly element: HTMLElement

  private readonly content: HTMLDivElement
  private readonly emptyNodes: readonly HTMLElement[]
  private readonly detailNodes: readonly HTMLElement[]
  private readonly symbolNode: HTMLDivElement
  private readonly nameNode: HTMLDivElement
  private readonly numberNode: HTMLElement
  private readonly periodNode: HTMLElement

  private disposed = false

  constructor() {
    const root = document.createElement('section')
    root.className = 'pt-selected'

    const label = createDiv(
      'pt-section-label',
      'SELECTED ELEMENT',
    )

    this.content = document.createElement('div')
    this.content.className = 'pt-selected-content'
    this.content.setAttribute(
      'aria-live',
      'polite',
    )

    this.emptyNodes = buildEmptyNodes()

    const detail = buildDetailNodes()

    this.detailNodes = detail.nodes
    this.symbolNode = detail.symbol
    this.nameNode = detail.name
    this.numberNode = detail.number
    this.periodNode = detail.period

    this.content.append(
      ...this.emptyNodes,
    )

    root.append(
      label,
      this.content,
    )

    this.element = root
  }

  setSelected(
    element: PeriodicTableElement | undefined,
  ): void {
    if (this.disposed) {
      return
    }

    if (!element) {
      this.content.replaceChildren(
        ...this.emptyNodes,
      )

      return
    }

    this.symbolNode.textContent =
      element.symbol

    this.nameNode.textContent =
      element.name

    this.numberNode.textContent =
      String(element.atomicNumber)

    this.periodNode.textContent =
      String(element.position.period)

    this.content.replaceChildren(
      ...this.detailNodes,
    )
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.element.remove()
  }
}

function createDiv(
  className: string,
  text?: string,
): HTMLDivElement {
  const node = document.createElement('div')

  node.className = className

  if (text !== undefined) {
    node.textContent = text
  }

  return node
}

function buildEmptyNodes(): readonly HTMLElement[] {
  const body = document.createElement('div')

  body.append(
    createDiv(
      'pt-empty-title',
      'Select an element',
    ),
    createDiv(
      'pt-empty-text',
      'Click any tile to inspect its details.',
    ),
  )

  return [
    createDiv('pt-empty-icon', '+'),
    body,
  ]
}

function createMeta(
  label: string,
): {
  readonly row: HTMLDivElement
  readonly value: HTMLElement
} {
  const row = createDiv('pt-element-meta')
  const value = document.createElement('strong')

  row.append(
    `${label} `,
    value,
  )

  return {
    row,
    value,
  }
}

function buildDetailNodes(): DetailNodes {
  const symbol = createDiv(
    'pt-element-symbol',
  )

  const name = createDiv(
    'pt-element-name',
  )

  const atomic = createMeta(
    'Atomic number',
  )

  const period = createMeta(
    'Period',
  )

  const info = createDiv(
    'pt-element-info',
  )

  info.append(
    name,
    atomic.row,
    period.row,
  )

  return {
    nodes: [
      symbol,
      info,
    ],
    symbol,
    name,
    number: atomic.value,
    period: period.value,
  }
}