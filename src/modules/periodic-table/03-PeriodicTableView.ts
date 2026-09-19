import type {
  Object3D,
  Sprite,
} from 'three'

import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three'

import type {
  PeriodicTableElement,
  PeriodicTableCategory,
} from '../../domain/periodic-table/PeriodicTableElement'

import type {
  PeriodicTableCatalog,
} from '../../domain/periodic-table/PeriodicTableCatalog'

import type {
  PeriodicTableLayout,
} from './02-PeriodicTableLayout'

import type {
  PeriodicTableVisual,
} from './07-PeriodicTableVisual'

import {
  PeriodicTableSpatialIndex,
} from './05-PeriodicTableSpatialIndex'

import {
  PeriodicTableLabel,
} from './06-PeriodicTableLabel'


const TILE_WIDTH = 0.9
const TILE_HEIGHT = 0.9
const TILE_DEPTH = 0.18


export class PeriodicTableView {
  readonly object: Group


  private readonly catalog:
    PeriodicTableCatalog

  private readonly layout:
    PeriodicTableLayout

  private readonly visual:
    PeriodicTableVisual

  private readonly spatialIndex:
    PeriodicTableSpatialIndex

  private readonly label:
    PeriodicTableLabel


  /**
   * Satu geometry dipakai oleh seluruh
   * element mesh.
   *
   * Ownership berada pada View.
   */
  private readonly geometry:
    BoxGeometry


  /**
   * Memetakan Object3D ke element domain.
   *
   * WeakMap digunakan supaya View tidak
   * membuat ownership graph tambahan.
   */
  private readonly elementByObject =
    new WeakMap<
      Object3D,
      PeriodicTableElement
    >()


  /**
   * Material normal berdasarkan kategori.
   *
   * Satu material digunakan bersama oleh
   * semua tile dalam kategori yang sama.
   */
  private readonly categoryMaterialCache =
    new Map<
      PeriodicTableCategory,
      MeshBasicMaterial
    >()


  /**
   * Material khusus interaction.
   *
   * Tidak dimasukkan ke category cache.
   */
  private readonly hoverMaterial:
    MeshBasicMaterial

  private readonly selectedMaterial:
    MeshBasicMaterial


  /**
   * Semua label Sprite yang dibuat oleh View.
   *
   * Digunakan untuk disposal texture/material.
   */
  private readonly labels:
    Sprite[] = []


  /**
   * Element yang sedang dipilih.
   */
  private selectedMesh:
    Mesh | null = null


  /**
   * Element yang sedang di-hover.
   */
  private hoveredMesh:
    Mesh | null = null


  private disposed = false


  constructor(
    catalog: PeriodicTableCatalog,
    layout: PeriodicTableLayout,
    visual: PeriodicTableVisual,
  ) {
    this.catalog = catalog
    this.layout = layout
    this.visual = visual


    this.object = new Group()

    this.object.name =
      'PeriodicTableView'


    this.spatialIndex =
      new PeriodicTableSpatialIndex()


    this.geometry =
      new BoxGeometry(
        TILE_WIDTH,
        TILE_HEIGHT,
        TILE_DEPTH,
      )


    this.label =
      new PeriodicTableLabel({
        tileDepth: TILE_DEPTH,
      })


    this.hoverMaterial =
      new MeshBasicMaterial()


    this.selectedMaterial =
      new MeshBasicMaterial()


    this.visual.applySelected(
      this.selectedMaterial,
    )


    this.build()
  }


  /**
   * Object yang bisa digunakan sebagai
   * root interaction.
   */
  getInteractiveObjects():
    readonly Object3D[] {

    return this.object.children
  }


  /**
   * Mendapatkan element domain dari
   * Object3D atau child-nya.
   */
  getElement(
    object: Object3D,
  ): PeriodicTableElement | undefined {

    let current:
      Object3D | null = object


    while (current) {

      const element =
        this.elementByObject.get(
          current,
        )


      if (element) {
        return element
      }


      current =
        current.parent
    }


    return undefined
  }


  /**
   * Mencari mesh berdasarkan posisi dunia.
   */
  getMeshAtWorldPosition(
    x: number,
    y: number,
  ): Mesh | null {

    if (this.disposed) {
      return null
    }


    return this.spatialIndex
      .getAtWorldPosition(
        x,
        y,
      )
  }


  /**
   * Mengubah state hover.
   *
   * null berarti tidak ada object
   * yang sedang di-hover.
   */
  setHovered(
    object: Object3D | null,
  ): void {

    if (this.disposed) {
      return
    }


    const mesh =
      this.resolveMesh(object)


    if (mesh === this.hoveredMesh) {
      return
    }


    this.restorePreviousHover()


    this.hoveredMesh =
      mesh


    if (!mesh) {
      return
    }


    /**
     * Selected object tetap menggunakan
     * selected material meskipun sedang
     * di-hover.
     */
    if (
      mesh === this.selectedMesh
    ) {
      return
    }


    this.applyHover(mesh)
  }


  /**
   * Mengubah object yang sedang dipilih.
   */
  setSelected(
    object: Object3D | null,
  ): void {

    if (this.disposed) {
      return
    }


    const mesh =
      this.resolveMesh(object)


    /**
     * Tidak melakukan pekerjaan ulang
     * apabila object yang dipilih sama.
     */
    if (
      mesh === this.selectedMesh
    ) {
      return
    }


    this.restorePreviousSelection()


    this.selectedMesh =
      mesh


    if (!mesh) {
      return
    }


    /**
     * Jika object sedang hover, selection
     * mengambil prioritas visual.
     */
    this.applySelection(mesh)
  }


  /**
   * Menghapus selection tanpa mengubah
   * object hover.
   *
   * Ini adalah API yang dipanggil oleh
   * PeriodicTableModule.
   */
  clearSelection(): void {

    if (this.disposed) {
      return
    }


    if (!this.selectedMesh) {
      return
    }


    const selected =
      this.selectedMesh


    this.selectedMesh = null


    /**
     * Kalau tile yang di-clear masih
     * sedang di-hover, jangan langsung
     * mengubahnya ke normal.
     *
     * Setelah selection hilang, tile
     * harus kembali ke visual hover.
     */
    if (
      selected === this.hoveredMesh
    ) {
      this.applyHover(selected)
      return
    }


    this.restoreMeshToNormal(
      selected,
    )
  }


  /**
   * Membersihkan seluruh resource View.
   */
  dispose(): void {

    if (this.disposed) {
      return
    }


    this.disposed = true


    this.disposeLabels()


    this.disposeMaterials()


    this.spatialIndex.clear()


    this.geometry.dispose()


    this.object.clear()


    this.selectedMesh = null
    this.hoveredMesh = null
  }


  /**
   * Membuat seluruh periodic table.
   */
  private build(): void {

    const elements =
      this.catalog.getAll()


    for (
      const element of elements
    ) {

      this.createElement(
        element,
      )
    }
  }


  /**
   * Membuat satu tile element.
   */
  private createElement(
    element: PeriodicTableElement,
  ): void {

    const material =
      this.getCategoryMaterial(
        element.category,
      )


    const mesh =
      new Mesh(
        this.geometry,
        material,
      )


    const x =
      this.layout.getX(
        element,
      )


    const y =
      this.layout.getY(
        element,
      )


    mesh.position.set(
      x,
      y,
      0,
    )


    mesh.name =
      `Element-${element.symbol}`


    /**
     * Simpan mapping mesh -> domain.
     */
    this.elementByObject.set(
      mesh,
      element,
    )


    /**
     * Register posisi untuk picking.
     */
    this.spatialIndex.register(
      mesh,
      x,
      y,
    )


    /**
     * Buat label symbol + atomic number.
     */
    const label =
      this.createElementLabel(
        element,
      )


    mesh.add(label)


    this.object.add(
      mesh,
    )
  }


  /**
   * Membuat label untuk element.
   */
  private createElementLabel(
    element: PeriodicTableElement,
  ): Sprite {

    const sprite =
      this.label.create(
        element,
      )


    this.elementByObject.set(
      sprite,
      element,
    )


    this.labels.push(
      sprite,
    )


    return sprite
  }


  /**
   * Mengambil material berdasarkan
   * kategori element.
   *
   * Material dibuat hanya sekali
   * untuk setiap kategori.
   */
  private getCategoryMaterial(
    category: PeriodicTableCategory,
  ): MeshBasicMaterial {

    const cached =
      this.categoryMaterialCache.get(
        category,
      )


    if (cached) {
      return cached
    }


    const material =
      new MeshBasicMaterial({
        color:
          this.visual.getBaseColor(
            category,
          ),
      })


    this.categoryMaterialCache.set(
      category,
      material,
    )


    return material
  }


  /**
   * Mengubah Object3D menjadi Mesh element.
   *
   * Karena label adalah Sprite child dari
   * Mesh, pencarian dilakukan naik ke parent.
   */
  private resolveMesh(
    object: Object3D | null,
  ): Mesh | null {

    if (!object) {
      return null
    }


    return this.findMesh(
      object,
    )
  }


  private findMesh(
    object: Object3D,
  ): Mesh | null {

    let current:
      Object3D | null = object


    while (current) {

      if (
        current instanceof Mesh
      ) {
        return current
      }


      current =
        current.parent
    }


    return null
  }


  /**
   * Menerapkan visual hover.
   */
  private applyHover(
    mesh: Mesh,
  ): void {
    const targetMesh = mesh
    const element =
      this.elementByObject.get(
        targetMesh,
    )
    if (!element) {
      return
    }
    const baseColor =
    this.visual.getBaseColor(
      element.category,
      )
      this.visual.applyHover(
        this.hoverMaterial,
        baseColor,
      )
    targetMesh.material = this.hoverMaterial
    targetMesh.scale.setScalar(
      this.visual.getHoverScale(),
    )
   }

  /**
   * Menerapkan visual selection.
   */
  private applySelection(
    mesh: Mesh,
  ): void {
    const targetMesh =
      mesh
    targetMesh.material =
      this.selectedMaterial
    targetMesh.scale.setScalar(
      this.visual.getSelectedScale(),
    )
  }


  /**
   * Mengembalikan hover sebelumnya
   * ke state normal.
   */
  private restorePreviousHover(): void {

    if (!this.hoveredMesh) {
      return
    }


    /**
     * Jangan restore selected mesh.
     */
    if (
      this.hoveredMesh ===
      this.selectedMesh
    ) {
      return
    }


    this.restoreMeshToNormal(
      this.hoveredMesh,
    )
  }


  /**
   * Mengembalikan selection sebelumnya
   * ke state yang sesuai.
   */
  private restorePreviousSelection(): void {

    if (!this.selectedMesh) {
      return
    }


    const selected =
      this.selectedMesh


    /**
     * Kalau selected masih di-hover,
     * state setelah selection dilepas
     * harus menjadi hover.
     */
    if (
      selected === this.hoveredMesh
    ) {
      this.applyHover(
        selected,
      )

      return
    }
    this.restoreMeshToNormal(
      selected,
    )
  }


  /**
   * Mengembalikan mesh ke material
   * dan scale normal.
   */
  private restoreMeshToNormal(
    mesh: Mesh,
  ): void {
    const targetMesh = mesh
    const element =
    this.elementByObject.get(
      targetMesh,
    )
    if (!element) {
      return
    }
    targetMesh.material =
    this.getCategoryMaterial(
      element.category,
    )
    targetMesh.scale.setScalar(
      this.visual.getNormalScale(),
    )
  }

  /**
   * Dispose semua Sprite label.
   */
  private disposeLabels(): void {

    for (
      const sprite of this.labels
    ) {

      this.label.dispose(
        sprite,
      )
    }


    this.labels.length = 0
  }

  /**
   * Dispose semua material.
   */
  private disposeMaterials(): void {

    for (
      const material of
      this.categoryMaterialCache.values()
    ) {
      material.dispose()
    }
    this.categoryMaterialCache.clear()
    this.hoverMaterial.dispose()
    this.selectedMaterial.dispose()
  }
}