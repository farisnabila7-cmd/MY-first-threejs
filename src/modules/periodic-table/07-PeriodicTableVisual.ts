import type { MeshBasicMaterial } from 'three';
import type { PeriodicTableCategory } from '../../domain/periodic-table/PeriodicTableElement';

const SELECTION_COLOR = 0xffffff;
const HOVER_BRIGHTNESS = 0.12;
const HOVER_SCALE = 1.06;
const SELECTED_SCALE = 1.1;

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
};

export class PeriodicTableVisual {
  getBaseColor(category: PeriodicTableCategory): number {
    return CATEGORY_COLORS[category];
  }

  applyBase(material: MeshBasicMaterial, color: number): void {
    material.color.setHex(color);
  }

  applyHover(material: MeshBasicMaterial, baseColor: number): void {
    material.color.setHex(baseColor);
    material.color.offsetHSL(0, 0, HOVER_BRIGHTNESS);
  }

  applySelected(material: MeshBasicMaterial): void {
    material.color.setHex(SELECTION_COLOR);
  }

  getHoverScale(): number {
    return HOVER_SCALE;
  }

  getSelectedScale(): number {
    return SELECTED_SCALE;
  }

  getNormalScale(): number {
    return 1;
  }
}