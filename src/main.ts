import './style.css'
import { Application } from './app/Application'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Element #app tidak ditemukan')
}

const application = new Application(app)

application.start()

if (import.meta.env.DEV) {
  /*
   * Dev-only budget probe. In the console:
   *   const a = __app.getStats(); await sleep(5000); __app.getStats().frames === a.frames
   * must be true while you are not touching the page.
   */
  Object.assign(globalThis, { __app: application })

  import.meta.hot?.dispose(() => {
    application.dispose()
  })
}
