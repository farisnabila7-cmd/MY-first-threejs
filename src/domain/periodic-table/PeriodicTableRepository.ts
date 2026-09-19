import type {
  PeriodicTableElement,
} from './PeriodicTableElement'

export interface PeriodicTableRepository {
  getByAtomicNumber(
    atomicNumber: number,
  ): PeriodicTableElement | undefined

  getAll(): readonly PeriodicTableElement[]
}