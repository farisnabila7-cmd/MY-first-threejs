export class PeriodicTableMenuHeader {
  readonly element: HTMLElement

  private disposed = false

  constructor(toggle?: HTMLElement) {
    const root = document.createElement('div')
    root.className = 'pt-header'

    const content = document.createElement('div')
    const eyebrow = createDiv('pt-eyebrow', 'ATOMIC EXPLORER')
    const title = createDiv('pt-title', 'Periodic Table')
    const subtitle = createDiv('pt-subtitle', 'Interactive 3D learning module')

    content.append(eyebrow, title, subtitle)

    if (toggle) {
      root.append(content, toggle)
    } else {
      root.append(content)
    }

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

function createDiv(className: string, text: string): HTMLDivElement {
  const node = document.createElement('div')
  node.className = className
  node.textContent = text
  return node
}
