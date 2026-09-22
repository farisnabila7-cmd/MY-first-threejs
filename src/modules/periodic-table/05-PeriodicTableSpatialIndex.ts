const CELL_HALF_EXTENT = 0.525

export interface SpatialEntry {
  readonly x: number
  readonly y: number
}

export class PeriodicTableSpatialIndex<T extends SpatialEntry> {
  private readonly entries: T[] = []

  register(entry: T): void {
    this.entries.push(entry)
  }

  getAtWorldPosition(x: number, y: number): T | null {
    for (const entry of this.entries) {
      const insideX = Math.abs(x - entry.x) <= CELL_HALF_EXTENT
      const insideY = Math.abs(y - entry.y) <= CELL_HALF_EXTENT

      if (insideX && insideY) {
        return entry
      }
    }

    return null
  }

  clear(): void {
    this.entries.length = 0
  }
}
