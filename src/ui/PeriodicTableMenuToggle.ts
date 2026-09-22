export interface PeriodicTableMenuToggleOptions {
  readonly target: HTMLElement
  readonly onToggle?: (open: boolean) => void
}

const MENU_CLOSED_CLASS = 'is-closed'
const ARIA_EXPANDED = 'aria-expanded'
const ARIA_LABEL = 'aria-label'
const ARIA_TRUE = 'true'
const ARIA_FALSE = 'false'
const LABEL_OPEN = 'Open menu'
const LABEL_CLOSE = 'Close menu'
const ICON_OPEN = '›'
const ICON_CLOSE = '‹'

export class PeriodicTableMenuToggle {
  readonly element: HTMLButtonElement

  private readonly target: HTMLElement
  private readonly onToggle: ((open: boolean) => void) | undefined

  private open = true
  private disposed = false

  private readonly handleClick = (): void => {
    if (this.disposed) {
      return
    }
    this.setOpen(!this.open)
  }

  constructor(options: PeriodicTableMenuToggleOptions) {
    this.target = options.target
    this.onToggle = options.onToggle

    this.element = document.createElement('button')
    this.element.type = 'button'
    this.element.className = 'pt-menu-toggle'

    this.element.setAttribute(ARIA_EXPANDED, ARIA_TRUE)
    this.element.setAttribute(ARIA_LABEL, LABEL_CLOSE)
    this.element.textContent = ICON_CLOSE

    this.element.addEventListener('click', this.handleClick)
  }

  setOpen(open: boolean): void {
    if (this.disposed || this.open === open) {
      return
    }

    this.open = open

    if (open) {
      this.target.classList.remove(MENU_CLOSED_CLASS)
      this.element.setAttribute(ARIA_EXPANDED, ARIA_TRUE)
      this.element.setAttribute(ARIA_LABEL, LABEL_CLOSE)
      this.element.textContent = ICON_CLOSE
    } else {
      this.target.classList.add(MENU_CLOSED_CLASS)
      this.element.setAttribute(ARIA_EXPANDED, ARIA_FALSE)
      this.element.setAttribute(ARIA_LABEL, LABEL_OPEN)
      this.element.textContent = ICON_OPEN
    }

    this.onToggle?.(open)
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.element.removeEventListener('click', this.handleClick)
    this.element.remove()
  }
}
