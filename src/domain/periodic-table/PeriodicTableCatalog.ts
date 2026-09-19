import type {
  PeriodicTableElement,
} from './PeriodicTableElement'

import type {
  PeriodicTableRepository,
} from './PeriodicTableRepository'

export class PeriodicTableCatalog {
  private readonly repository: PeriodicTableRepository

  constructor(
    repository: PeriodicTableRepository,
  ) {
    this.repository = repository
  }

  getByAtomicNumber(
    atomicNumber: number,
  ): PeriodicTableElement | undefined {
    return this.repository.getByAtomicNumber(
      atomicNumber,
    )
  }

  getAll(): readonly PeriodicTableElement[] {
    return this.repository.getAll()
  }
}