export type PeriodicTableCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'

export interface PeriodicTablePosition {
  readonly period: number
  readonly group: number | null
}

export interface PeriodicTableElement {
  readonly atomicNumber: number
  readonly symbol: string
  readonly name: string

  readonly category: PeriodicTableCategory
  readonly position: PeriodicTablePosition
}