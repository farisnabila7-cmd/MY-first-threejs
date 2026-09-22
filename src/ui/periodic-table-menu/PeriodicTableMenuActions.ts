export interface PeriodicTableMenuActionsOptions {
  readonly onResetView: () => void
}

export class PeriodicTableMenuActions {
  readonly element: HTMLElement
  private readonly resetButton: HTMLButtonElement
  private readonly onResetView: () => void
  private disposed = false

  private readonly handleReset = (): void => {
    if (this.disposed) {
      return
    }
    this.onResetView()
  }

  constructor(options: PeriodicTableMenuActionsOptions) {
    this.onResetView = options.onResetView

    const root = document.createElement('div')

    this.resetButton = document.createElement('button')
    this.resetButton.type = 'button'
    this.resetButton.className = 'pt-reset'

    const text = document.createElement('span')
    text.textContent = 'Reset View'

    const icon = document.createElement('span')
    icon.className = 'pt-reset-icon'
    icon.textContent = '↺'

    this.resetButton.append(text, icon)
    this.resetButton.addEventListener('click', this.handleReset)

    root.appendChild(this.resetButton)
    this.element = root
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.resetButton.removeEventListener('click', this.handleReset)
    this.element.remove()
  }
}
