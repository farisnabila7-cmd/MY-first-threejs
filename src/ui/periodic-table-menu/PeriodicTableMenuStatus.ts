// const ELEMENT_COUNT = 118

// export class PeriodicTableMenuStatus {
//   readonly element: HTMLElement

//   private disposed = false

//   constructor() {
//     const root = document.createElement('section')
//     root.className = 'pt-status'

//     const label = createDiv(
//       'pt-section-label',
//       'MODULE',
//     )

//     const row = document.createElement('div')
//     row.className = 'pt-status-row'

//     const state = document.createElement('div')
//     state.className = 'pt-status-state'

//     const readyDot = document.createElement('span')
//     readyDot.className = 'pt-ready-dot'

//     const readyText = document.createElement('span')
//     readyText.textContent = 'Ready'

//     state.append(
//       readyDot,
//       readyText,
//     )

//     const count = document.createElement('div')
//     count.className = 'pt-count'

//     const countValue = document.createElement('strong')
//     countValue.textContent =
//       String(ELEMENT_COUNT)

//     const countLabel = document.createElement('span')
//     countLabel.textContent = 'elements'

//     count.append(
//       countValue,
//       countLabel,
//     )

//     row.append(
//       state,
//       count,
//     )

//     root.append(
//       label,
//       row,
//     )

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

// function createDiv(
//   className: string,
//   text: string,
// ): HTMLDivElement {
//   const node = document.createElement('div')

//   node.className = className
//   node.textContent = text

//   return node
// }