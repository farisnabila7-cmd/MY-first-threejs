import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
} from 'three'

import type {
  PeriodicTableElement,
} from '../../domain/periodic-table/PeriodicTableElement'

/**
 * One texture + one geometry + one draw call for all
 * labels, instead of one canvas/texture/material/sprite
 * per element.
 *
 * Memory note: texel count is the same as before at
 * CELL_SIZE 128 (118 * 128 * 128). Lower CELL_SIZE if
 * GPU memory matters more than max-zoom sharpness:
 * 96 => -44%, 64 => -75%.
 */
const CELL_SIZE = 128
const CELL_CENTER = CELL_SIZE / 2
const COLUMNS = 12

const SYMBOL_FONT = '700 48px sans-serif'
const ATOMIC_NUMBER_FONT = '500 18px sans-serif'

const SYMBOL_Y_OFFSET = 6
const ATOMIC_NUMBER_Y = 20

const LABEL_SIZE = 0.82
const LABEL_Z_OFFSET = 0.02

const MAX_ANISOTROPY = 4

const VERTICES_PER_QUAD = 4
const INDICES_PER_QUAD = 6

const POSITION_COMPONENTS = 3
const UV_COMPONENTS = 2
const INDEX_COMPONENTS = 1

const FIRST_TRIANGLE_SECOND_VERTEX = 1
const FIRST_TRIANGLE_THIRD_VERTEX = 2
const SECOND_TRIANGLE_SECOND_VERTEX = 2
const SECOND_TRIANGLE_THIRD_VERTEX = 3

export interface LabelPlacement {
  readonly element: PeriodicTableElement
  readonly x: number
  readonly y: number
}

export class PeriodicTableLabelAtlas {
  readonly object: Mesh

  private readonly geometry: BufferGeometry
  private readonly material: MeshBasicMaterial
  private readonly texture: CanvasTexture

  private disposed = false

  constructor(
    placements: readonly LabelPlacement[],
    tileDepth: number,
  ) {
    const rows = Math.max(
      1,
      Math.ceil(
        placements.length / COLUMNS,
      ),
    )

    this.texture =
      new CanvasTexture(
        drawAtlas(
          placements,
          rows,
        ),
      )

    this.texture.colorSpace =
      SRGBColorSpace

    this.texture.anisotropy =
      MAX_ANISOTROPY

    this.geometry =
      buildGeometry(
        placements,
        rows,
        (tileDepth / 2) +
          LABEL_Z_OFFSET,
      )

    this.material =
      new MeshBasicMaterial({
        map: this.texture,
        transparent: true,
        depthWrite: false,
      })

    this.object =
      new Mesh(
        this.geometry,
        this.material,
      )

    this.object.name =
      'PeriodicTableLabels'
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true

    this.texture.dispose()
    this.material.dispose()
    this.geometry.dispose()
  }
}

function drawAtlas(
  placements: readonly LabelPlacement[],
  rows: number,
): HTMLCanvasElement {
  const canvas =
    document.createElement(
      'canvas',
    )

  canvas.width =
    COLUMNS * CELL_SIZE

  canvas.height =
    rows * CELL_SIZE

  const context =
    canvas.getContext('2d')

  if (!context) {
    throw new Error(
      'Canvas 2D context tidak tersedia',
    )
  }

  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#ffffff'

  for (
    const [index, placement]
    of placements.entries()
  ) {
    const column =
      index % COLUMNS

    const row =
      Math.floor(
        index / COLUMNS,
      )

    const centerX =
      (column * CELL_SIZE) +
      CELL_CENTER

    const cellTop =
      row * CELL_SIZE

    context.font =
      SYMBOL_FONT

    context.fillText(
      placement.element.symbol,
      centerX,
      cellTop +
        CELL_CENTER +
        SYMBOL_Y_OFFSET,
    )

    context.font =
      ATOMIC_NUMBER_FONT

    context.fillText(
      String(
        placement.element.atomicNumber,
      ),
      centerX,
      cellTop +
        ATOMIC_NUMBER_Y,
    )
  }

  return canvas
}

function buildGeometry(
  placements: readonly LabelPlacement[],
  rows: number,
  z: number,
): BufferGeometry {
  const count =
    placements.length

  const half =
    LABEL_SIZE / 2

  const positions =
    new Float32Array(
      count *
      VERTICES_PER_QUAD *
      POSITION_COMPONENTS,
    )

  const uvs =
    new Float32Array(
      count *
      VERTICES_PER_QUAD *
      UV_COMPONENTS,
    )

  const indices =
    new Uint16Array(
      count *
      INDICES_PER_QUAD,
    )

  for (
    const [index, placement]
    of placements.entries()
  ) {
    const column =
      index % COLUMNS

    const row =
      Math.floor(
        index / COLUMNS,
      )

    /*
     * Canvas row 0 is the TOP of the image.
     * UV v=1 is the top.
     */
    const u0 =
      column / COLUMNS

    const u1 =
      (column + 1) / COLUMNS

    const v1 =
      1 - (row / rows)

    const v0 =
      1 -
      ((row + 1) / rows)

    const vertexBase =
      index *
      VERTICES_PER_QUAD

    const positionOffset =
      vertexBase *
      POSITION_COMPONENTS

    const uvOffset =
      vertexBase *
      UV_COMPONENTS

    const left =
      placement.x - half

    const right =
      placement.x + half

    const bottom =
      placement.y - half

    const quadTop =
      placement.y + half

    positions.set(
      [
        left,
        bottom,
        z,

        right,
        bottom,
        z,

        right,
        quadTop,
        z,

        left,
        quadTop,
        z,
      ],
      positionOffset,
    )

    uvs.set(
      [
        u0,
        v0,

        u1,
        v0,

        u1,
        v1,

        u0,
        v1,
      ],
      uvOffset,
    )

    indices.set(
      [
        vertexBase,
        vertexBase +
          FIRST_TRIANGLE_SECOND_VERTEX,
        vertexBase +
          FIRST_TRIANGLE_THIRD_VERTEX,

        vertexBase,
        vertexBase +
          SECOND_TRIANGLE_SECOND_VERTEX,
        vertexBase +
          SECOND_TRIANGLE_THIRD_VERTEX,
      ],
      index *
        INDICES_PER_QUAD,
    )
  }

  const geometry =
    new BufferGeometry()

  geometry.setAttribute(
    'position',
    new BufferAttribute(
      positions,
      POSITION_COMPONENTS,
    ),
  )

  geometry.setAttribute(
    'uv',
    new BufferAttribute(
      uvs,
      UV_COMPONENTS,
    ),
  )

  geometry.setIndex(
    new BufferAttribute(
      indices,
      INDEX_COMPONENTS,
    ),
  )

  return geometry
}