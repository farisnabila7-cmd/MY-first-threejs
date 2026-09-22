import './style.css'
import { Application } from './app/Application'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Element #app tidak ditemukan')
}

const application = new Application(app)

application.start()

if (import.meta.env.DEV) {
  /**
   * Utilitas pengembangan: sematkan aplikasi ke cakupan global (global scope) untuk proses debugging performa.
   *
   * Penggunaan di konsol peramban (browser console):
   * ```
   * const stats = __app.getStats()
   * await new Promise(r => setTimeout(r, 5000))
   * console.assert(__app.getStats().frames === stats.frames, 'Jumlah frame berubah!')
   * ```
   *
   * Jika frame tidak berubah, scene dalam posisi diam/idle (bagus). Jika frame berubah, proses rendering masih berjalan.
   */
  Object.assign(globalThis, { __app: application })

  import.meta.hot?.dispose(() => {
    application.dispose()
  })
}
