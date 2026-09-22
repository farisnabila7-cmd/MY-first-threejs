import {
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
} from 'three'

import type {
  PeriodicTableElement,
} from '../../domain/periodic-table/PeriodicTableElement'

import type {
  PeriodicTableCatalog,
} from '../../domain/periodic-table/PeriodicTableCatalog'

import type {
  PeriodicTableLayout,
} from './02-PeriodicTableLayout'

import type {
  PeriodicTableVisual,
  TileVisualState,
} from './07-PeriodicTableVisual'

import {
  PeriodicTableSpatialIndex,
} from './05-PeriodicTableSpatialIndex'

import {
  PeriodicTableLabelAtlas,
} from './06-PeriodicTableLabel'

const TILE_WIDTH = 0.9
const TILE_HEIGHT = 0.9
const TILE_DEPTH = 0.18

/**
 * Stable identity of a tile is the atomic number.
 * `index` is its slot inside the InstancedMesh.
 */
interface TileRecord {
  readonly id: number
  readonly index: number
  readonly element: PeriodicTableElement
  readonly x: number
  readonly y: number
  readonly baseColor: number
}

/**
 * Renders all tiles with ONE InstancedMesh
 * plus ONE label mesh.
 *
 * Visual state is DERIVED, never "restored":
 *
 *   state(tile) = selected ? 'selected'
 *               : hovered  ? 'hover'
 *               : 'normal'
 *
 * so hover/selection can never drift out of sync.
 *
 * Every mutator returns true when something visible
 * changed, so callers know whether to request a render.
 */
export class PeriodicTableView {
  readonly object: Group

  /** World Z of the tile face facing +Z (pick plane). */
  readonly frontFaceZ = TILE_DEPTH / 2

  private readonly geometry: BoxGeometry
  private readonly material: MeshBasicMaterial
  private readonly tiles: InstancedMesh
  private readonly labels: PeriodicTableLabelAtlas

  private readonly visual: PeriodicTableVisual
  private readonly records: readonly TileRecord[]

  private readonly recordById =
    new Map<number, TileRecord>()

  private readonly spatialIndex =
    new PeriodicTableSpatialIndex<TileRecord>()

  /** Scratch objects: zero allocation per hover/select. */
  private readonly scratchColor = new Color()
  private readonly scratchMatrix = new Matrix4()

  private hoveredId: number | null = null
  private selectedId: number | null = null

  private disposed = false

  constructor(
    catalog: PeriodicTableCatalog,
    layout: PeriodicTableLayout,
    visual: PeriodicTableVisual,
  ) {
    this.visual = visual

    this.records = catalog
      .getAll()
      .map((element, index) => ({
        index,
        element,
        id: element.atomicNumber,
        x: layout.getX(element),
        y: layout.getY(element),
        baseColor:
          visual.getBaseColor(
            element.category,
          ),
      }))

    this.geometry = new BoxGeometry(
      TILE_WIDTH,
      TILE_HEIGHT,
      TILE_DEPTH,
    )

    /*
     * White base:
     * per-instance color multiplies it.
     */
    this.material =
      new MeshBasicMaterial()

    this.tiles =
      new InstancedMesh(
        this.geometry,
        this.material,
        this.records.length,
      )

    this.tiles.name =
      'PeriodicTableTiles'

    this.tiles.instanceMatrix.setUsage(
      DynamicDrawUsage,
    )

    /*
     * Bounding volume is computed once
     * from initial instances.
     *
     * Hover scale would make it stale.
     */
    this.tiles.frustumCulled =
      false

    this.labels =
      new PeriodicTableLabelAtlas(
        this.records,
        TILE_DEPTH,
      )

    for (
      const record of this.records
    ) {
      this.recordById.set(
        record.id,
        record,
      )

      this.spatialIndex.register(
        record,
      )

      this.paint(record)
    }

    /*
     * instanceColor exists only after
     * the first setColorAt().
     */
    this.tiles.instanceColor
      ?.setUsage(
        DynamicDrawUsage,
      )

    this.commit()

    this.object = new Group()

    this.object.name =
      'PeriodicTableView'

    this.object.add(
      this.tiles,
      this.labels.object,
    )
  }

  get hoveredTileId(): number | null {
    return this.hoveredId
  }

  getElement(
    id: number,
  ): PeriodicTableElement | undefined {
    return this.recordById
      .get(id)
      ?.element
  }

  /** Tile id under a world-space point on the table plane. */
  pick(
    worldX: number,
    worldY: number,
  ): number | null {
    if (this.disposed) {
      return null
    }

    return this.spatialIndex
      .getAtWorldPosition(
        worldX,
        worldY,
      )
      ?.id ?? null
  }

  setHovered(
    id: number | null,
  ): boolean {
    if (this.disposed) {
      return false
    }

    const next =
      this.normalize(id)

    if (
      next === this.hoveredId
    ) {
      return false
    }

    const previous =
      this.hoveredId

    this.hoveredId =
      next

    this.repaint(previous)
    this.repaint(next)
    this.commit()

    return true
  }

  setSelected(
    id: number | null,
  ): boolean {
    if (this.disposed) {
      return false
    }

    const next =
      this.normalize(id)

    if (
      next === this.selectedId
    ) {
      return false
    }

    const previous =
      this.selectedId

    this.selectedId =
      next

    this.repaint(previous)
    this.repaint(next)
    this.commit()

    return true
  }

  clearSelection(): boolean {
    return this.setSelected(null)
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true

    this.labels.dispose()
    this.tiles.dispose()
    this.material.dispose()
    this.geometry.dispose()

    this.spatialIndex.clear()
    this.recordById.clear()

    this.object.clear()

    this.hoveredId = null
    this.selectedId = null
  }

  private normalize(
    id: number | null,
  ): number | null {
    if (id === null) {
      return null
    }

    if (this.recordById.has(id)) {
      return id
    }

    return null
  }

  private resolveState(
    id: number,
  ): TileVisualState {
    if (id === this.selectedId) {
      return 'selected'
    }

    if (id === this.hoveredId) {
      return 'hover'
    }

    return 'normal'
  }

  private repaint(
    id: number | null,
  ): void {
    if (id === null) {
      return
    }

    const record =
      this.recordById.get(id)

    if (record) {
      this.paint(record)
    }
  }

  private paint(
    record: TileRecord,
  ): void {
    const state =
      this.resolveState(record.id)

    const scale =
      this.visual.getScale(state)

    this.visual.resolveColor(
      this.scratchColor,
      record.baseColor,
      state,
    )

    this.tiles.setColorAt(
      record.index,
      this.scratchColor,
    )

    this.scratchMatrix
      .makeScale(
        scale,
        scale,
        scale,
      )
      .setPosition(
        record.x,
        record.y,
        0,
      )

    this.tiles.setMatrixAt(
      record.index,
      this.scratchMatrix,
    )
  }

  private commit(): void {
    this.tiles.instanceMatrix.needsUpdate =
      true

    if (this.tiles.instanceColor) {
      this.tiles.instanceColor.needsUpdate =
        true
    }
  }
}