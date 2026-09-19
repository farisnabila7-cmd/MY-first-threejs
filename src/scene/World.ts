import { Scene } from 'three'

import type {
  DisposableObject,
} from './objects/DisposableObject'

export class World {
  readonly scene: Scene

  private readonly objects:
    DisposableObject[] = []

  private disposed = false

  constructor() {
    this.scene = new Scene()
  }

  add(
    object: DisposableObject,
  ): void {
    if (this.disposed) {
      return
    }

    this.scene.add(
      object.object,
    )

    this.objects.push(
      object,
    )
  }

  remove(
    object: DisposableObject,
  ): void {
    if (this.disposed) {
      return
    }

    const index =
      this.objects.indexOf(object)

    if (index === -1) {
      return
    }

    this.scene.remove(
      object.object,
    )

    object.dispose()

    this.objects.splice(
      index,
      1,
    )
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true

    for (
      const object of this.objects
    ) {
      this.scene.remove(
        object.object,
      )

      object.dispose()
    }

    this.objects.length = 0

    this.scene.clear()
  }
}