import { CanvasTexture, Sprite, SpriteMaterial, SRGBColorSpace } from 'three';
import type { PeriodicTableElement } from '../../domain/periodic-table/PeriodicTableElement';

const LABEL_SIZE = 128;
const LABEL_CENTER = LABEL_SIZE / 2;

const SYMBOL_FONT = '700 48px sans-serif';
const ATOMIC_NUMBER_FONT = '500 18px sans-serif';

const SYMBOL_Y_OFFSET = 6;
const ATOMIC_NUMBER_Y = 20;

const LABEL_SCALE = 0.82;
const LABEL_Z_OFFSET = 0.02;

export interface PeriodicTableLabelConfig {
  readonly tileDepth: number;
}

export class PeriodicTableLabel {
  private readonly config: PeriodicTableLabelConfig;

  constructor(config: PeriodicTableLabelConfig) {
    this.config = config;
  }

  create(element: PeriodicTableElement): Sprite {
    const texture = this.createTexture(element);

    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const sprite = new Sprite(material);
    sprite.scale.set(LABEL_SCALE, LABEL_SCALE, 1);
    sprite.position.z = (this.config.tileDepth / 2) + LABEL_Z_OFFSET;

    return sprite;
  }

  dispose(sprite: Sprite): void {
    const material = sprite.material;
    if (!(material instanceof SpriteMaterial)) {
      return;
    }

    const texture = material.map;
    material.dispose();

    if (texture) {
      texture.dispose();
    }
  }

  private createTexture(element: PeriodicTableElement): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = LABEL_SIZE;
    canvas.height = LABEL_SIZE;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context tidak tersedia');
    }

    context.clearRect(0, 0, LABEL_SIZE, LABEL_SIZE);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ffffff';

    context.font = SYMBOL_FONT;
    context.fillText(element.symbol, LABEL_CENTER, LABEL_CENTER + SYMBOL_Y_OFFSET);

    context.font = ATOMIC_NUMBER_FONT;
    context.fillText(String(element.atomicNumber), LABEL_CENTER, ATOMIC_NUMBER_Y);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;

    return texture;
  }
}
