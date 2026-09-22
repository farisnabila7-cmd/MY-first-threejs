import { Engine } from '../core/Engine'
import type { RendererStats } from '../rendering/Renderer'
import { InMemoryPeriodicTableRepository } from '../data/periodic-table/InMemoryPeriodicTableRepository'
import { PeriodicTableCatalog } from '../domain/periodic-table/PeriodicTableCatalog'
import { PeriodicTableModule } from '../modules/periodic-table/01-PeriodicTableModule'
import { PeriodicTableMenu } from '../ui/PeriodicTableMenu'

export class Application {
  private readonly engine: Engine
  private readonly menu: PeriodicTableMenu
  private readonly periodicTable: PeriodicTableModule

  private disposed = false

  constructor(container: HTMLElement) {
    this.engine = new Engine(container)

    const repository = new InMemoryPeriodicTableRepository()
    const catalog = new PeriodicTableCatalog(repository)

    this.periodicTable = new PeriodicTableModule({
      catalog,
      camera: this.engine.cameraObject,
      element: this.engine.canvas,
      onSelect: element => {
        if (this.disposed) {
          return
        }
        this.menu.setSelected(element)
      },
      requestRender: () => {
        this.engine.requestRender()
      },
      subscribeCameraMoved: listener => this.engine.subscribeCameraMoved(listener),
    })

    this.menu = new PeriodicTableMenu(container, () => {
      if (this.disposed) {
        return
      }
      this.periodicTable.clearSelection()
      this.menu.setSelected(undefined)
      this.engine.resetView()
    })

    this.engine.sceneWorld.add(this.periodicTable)
  }

  start(): void {
    if (this.disposed) {
      return
    }
    this.engine.start()
  }

  getStats(): RendererStats {
    return this.engine.stats
  }

  dispose(): void {
    if (this.disposed) {
      return
    }
    this.disposed = true

    this.menu.dispose()
    this.engine.dispose()
  }
}
