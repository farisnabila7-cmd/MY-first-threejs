import type { PeriodicTableElement } from '../../domain/periodic-table/PeriodicTableElement'

const TILE_GAP = 1.05

const GROUP_CENTER = 9.5
const MAIN_TABLE_CENTER_PERIOD = 4

const F_BLOCK_START_X = -7

const LANTHANIDE_Y = -4.3
const ACTINIDE_Y = -5.4

const LANTHANIDE_START = 57
const ACTINIDE_START = 89

export class PeriodicTableLayout {
  getX(element: PeriodicTableElement): number {
    const group = element.position.group

    if (group !== null) {
      return (
        (group - GROUP_CENTER) *
        TILE_GAP
      )
    }

    return (
      F_BLOCK_START_X +
      (this.getFBlockIndex(element) *
        TILE_GAP)
    )
  }

  getY(element: PeriodicTableElement): number {
    const group = element.position.group

    if (group === null) {
      return this.getFBlockY(element)
    }

    return (
      (MAIN_TABLE_CENTER_PERIOD -
        element.position.period) *
      TILE_GAP
    )
  }

  private getFBlockIndex(element: PeriodicTableElement): number {
    if (
      element.atomicNumber >=
      ACTINIDE_START
    ) {
      return (
        element.atomicNumber -
        ACTINIDE_START
      )
    }

    return (
      element.atomicNumber -
      LANTHANIDE_START
    )
  }

  private getFBlockY(element: PeriodicTableElement): number {
    if (
      element.category ===
      'lanthanide'
    ) {
      return LANTHANIDE_Y
    }

    return ACTINIDE_Y
  }
}