import type {
  PeriodicTableElement,
} from '../../domain/periodic-table/PeriodicTableElement'

import type {
  PeriodicTableRepository,
} from '../../domain/periodic-table/PeriodicTableRepository'

import {
  PERIODIC_TABLE_ELEMENTS,
} from './periodicTableElements'

export class InMemoryPeriodicTableRepository
  implements PeriodicTableRepository {
  private readonly elements =
    PERIODIC_TABLE_ELEMENTS

  private index:
    | Map<number, PeriodicTableElement>
    | undefined

  getByAtomicNumber(
    atomicNumber: number,
  ): PeriodicTableElement | undefined {
    this.ensureIndex()

    return this.index?.get(atomicNumber)
  }

  getAll(): readonly PeriodicTableElement[] {
    return this.elements
  }

  private ensureIndex(): void {
    if (this.index) {
      return
    }

    this.index = new Map(
      this.elements.map(element => [
        element.atomicNumber,
        element,
      ]),
    )
  }
}