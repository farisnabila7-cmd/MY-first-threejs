import type { Mesh } from 'three';

interface SpatialEntry {
  readonly mesh: Mesh;
  readonly x: number;
  readonly y: number;
}

const PICK_RADIUS = 0.45;
const PICK_RADIUS_SQUARED = PICK_RADIUS * PICK_RADIUS;

export class PeriodicTableSpatialIndex {
  private readonly entries: SpatialEntry[] = [];

  register(mesh: Mesh, x: number, y: number): void {
    this.entries.push({ mesh, x, y });
  }

  getAtWorldPosition(x: number, y: number): Mesh | null {
    let closestMesh: Mesh | null = null;
    let closestDistanceSquared = Number.POSITIVE_INFINITY;

    for (const entry of this.entries) {
      const dx = x - entry.x;
      const dy = y - entry.y;
      const distanceSquared = (dx * dx) + (dy * dy);

      const isInsidePickRadius = distanceSquared <= PICK_RADIUS_SQUARED;
      const isCloser = distanceSquared < closestDistanceSquared;

      if (isInsidePickRadius && isCloser) {
        closestDistanceSquared = distanceSquared;
        closestMesh = entry.mesh;
      }
    }

    return closestMesh;
  }

  clear(): void {
    this.entries.length = 0;
  }
}
