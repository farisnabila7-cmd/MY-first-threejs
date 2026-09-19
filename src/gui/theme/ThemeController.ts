import type { Theme } from './Theme'

const STORAGE_KEY = 'app.theme'

export class ThemeController {
  private theme: Theme

  private readonly listeners =
    new Set<(theme: Theme) => void>()

  constructor() {
    this.theme =
      this.loadTheme()

    this.applyTheme()
  }

  getTheme(): Theme {
    return this.theme
  }

  setTheme(theme: Theme): void {
    if (this.theme === theme) {
      return
    }

    this.theme = theme

    this.saveTheme()
    this.applyTheme()
    this.notify()
  }

  toggle(): void {
    if (this.theme === 'light') {
      this.setTheme('night')
      return
    }

    this.setTheme('light')
  }

  subscribe(
    listener: (theme: Theme) => void,
  ): () => void {
    this.listeners.add(listener)

    listener(this.theme)

    return () => {
      this.listeners.delete(listener)
    }
  }

  dispose(): void {
    this.listeners.clear()
  }

  private loadTheme(): Theme {
    const stored =
      localStorage.getItem(
        STORAGE_KEY,
      )

    if (
      stored === 'light' ||
      stored === 'night'
    ) {
      return stored
    }

    return 'light'
  }

  private saveTheme(): void {
    localStorage.setItem(
      STORAGE_KEY,
      this.theme,
    )
  }

  private applyTheme(): void {
    document.documentElement.dataset['theme'] =
      this.theme
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.theme)
    }
  }
}