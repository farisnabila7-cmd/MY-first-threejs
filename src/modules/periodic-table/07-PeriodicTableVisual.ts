import type { Color } from 'three'
import type { PeriodicTableCategory } from '../../domain/periodic-table/PeriodicTableElement'

export type TileVisualState = 'normal' | 'hover' | 'selected'

const SELECTION_COLOR = 0xffffff
const HOVER_BRIGHTNESS = 0.12

const SCALE_BY_STATE: Record<TileVisualState, number> = {
  normal: 1,
  hover: 1.06,
  selected: 1.1,
}

const CATEGORY_COLORS: Record<PeriodicTableCategory, number> = {
  'alkali-metal': 0xef4444,
  'alkaline-earth-metal': 0xf97316,
  'transition-metal': 0xeab308,
  'post-transition-metal': 0x84cc16,
  metalloid: 0x22c55e,
  nonmetal: 0x14b8a6,
  halogen: 0x06b6d4,
  'noble-gas': 0x3b82f6,
  lanthanide: 0x8b5cf6,
  actinide: 0xa855f7,
}

export class PeriodicTableVisual {
  getBaseColor(category: PeriodicTableCategory): number {
    return CATEGORY_COLORS[category]
  }

  resolveColor(target: Color, baseColor: number, state: TileVisualState): void {
    if (state === 'selected') {
      target.setHex(SELECTION_COLOR)
      return
    }

    target.setHex(baseColor)

    if (state === 'hover') {
      target.offsetHSL(0, 0, HOVER_BRIGHTNESS)
    }
  }

  getScale(state: TileVisualState): number {
    return SCALE_BY_STATE[state]
  }
}
