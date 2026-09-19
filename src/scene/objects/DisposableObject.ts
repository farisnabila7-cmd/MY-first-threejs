import type {
  Object3D,
} from 'three'


export interface DisposableObject {
  readonly object: Object3D

  dispose(): void
}