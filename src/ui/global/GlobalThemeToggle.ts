import type { Theme } from '../../gui/theme/Theme'
import type { ThemeController } from '../../gui/theme/ThemeController'

export class GlobalThemeToggle {
  private readonly root: HTMLDivElement
  private readonly button: HTMLButtonElement
  private readonly label: HTMLSpanElement

  private readonly unsubscribe: () => void

  private readonly themeController:
    ThemeController

  private readonly handleClick = (): void => {
    this.themeController.toggle()
  }

  private readonly handleThemeChange = (
    theme: Theme,
  ): void => {
    this.render(theme)
  }

  constructor(
    container: HTMLElement,
    themeController: ThemeController,
  ) {
    this.themeController =
      themeController

    this.root =
      document.createElement('div')

    this.root.className =
      'global-theme-toggle'

    this.label =
      document.createElement('span')

    this.label.className =
      'global-theme-label'

    this.button =
      document.createElement('button')

    this.button.type = 'button'

    this.button.className =
      'global-theme-button'

    this.button.setAttribute(
      'aria-label',
      'Ganti mode siang dan malam',
    )

    this.button.addEventListener(
      'click',
      this.handleClick,
    )

    this.root.append(
      this.label,
      this.button,
    )

    container.appendChild(
      this.root,
    )

    this.unsubscribe =
      this.themeController.subscribe(
        this.handleThemeChange,
      )
  }

  dispose(): void {
    this.button.removeEventListener(
      'click',
      this.handleClick,
    )

    this.unsubscribe()

    this.root.remove()
  }

  private render(theme: Theme): void {
    if (theme === 'night') {
      this.renderNight()
      return
    }

    this.renderLight()
  }

  private renderNight(): void {
    this.label.textContent =
      'Malam'

    this.button.innerHTML = `
      <span
        class="global-theme-option muted"
        aria-hidden="true"
      >
        <!-- SVG matahari -->
      </span>

      <span class="global-theme-track">
        <span class="global-theme-handle">
          <!-- SVG bulan -->
        </span>
      </span>

      <span
        class="global-theme-option active"
        aria-hidden="true"
      >
        <!-- SVG bulan -->
      </span>
    `

    this.button.setAttribute(
      'aria-pressed',
      'true',
    )

    this.button.setAttribute(
      'title',
      'Aktif: Mode Malam. Klik untuk Mode Siang.',
    )
  }

  private renderLight(): void {
    this.label.textContent =
      'Siang'

    this.button.innerHTML = `
      <span
        class="global-theme-option active"
        aria-hidden="true"
      >
        <!-- SVG matahari -->
      </span>

      <span class="global-theme-track">
        <span class="global-theme-handle">
          <!-- SVG matahari -->
        </span>
      </span>

      <span
        class="global-theme-option muted"
        aria-hidden="true"
      >
        <!-- SVG bulan -->
      </span>
    `

    this.button.setAttribute(
      'aria-pressed',
      'false',
    )

    this.button.setAttribute(
      'title',
      'Aktif: Mode Siang. Klik untuk Mode Malam.',
    )
  }
}