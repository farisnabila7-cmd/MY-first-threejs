import './style.css'
import { Application } from './app/Application'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Element #app tidak ditemukan')
}

const application = new Application(app)

application.start()