// interface ControlDefinition {
//   readonly key: string
//   readonly label: string
// }

// const CONTROLS: readonly ControlDefinition[] = [
//   { key: 'LMB', label: 'Orbit' },
//   { key: 'RMB', label: 'Pan' },
//   { key: 'WHEEL', label: 'Zoom' },
//   { key: 'CLICK', label: 'Select' },
// ]

// export class PeriodicTableMenuControls {
//   readonly element: HTMLElement

//   private disposed = false

//   constructor() {
//     const root = document.createElement('section')
//     root.className = 'pt-controls'

//     const label = document.createElement('div')
//     label.className = 'pt-section-label'
//     label.textContent = 'CONTROLS'

//     const grid = document.createElement('div')
//     grid.className = 'pt-control-grid'

//     for (const control of CONTROLS) {
//       grid.appendChild(createControl(control))
//     }

//     root.append(label, grid)

//     this.element = root
//   }

//   dispose(): void {
//     if (this.disposed) {
//       return
//     }

//     this.disposed = true
//     this.element.remove()
//   }
// }

// function createControl(
//   control: ControlDefinition,
// ): HTMLElement {
//   const root = document.createElement('div')
//   root.className = 'pt-control'

//   const key = document.createElement('span')
//   key.className = 'pt-control-key'
//   key.textContent = control.key

//   const label = document.createElement('span')
//   label.textContent = control.label

//   root.append(key, label)

//   return root
// }