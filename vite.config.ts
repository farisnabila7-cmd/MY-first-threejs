// ini berhasil build
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/MY-first-threejs/',
})

// // ini panicked
// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//   ],

//   build: {
//     rollupOptions: {
//       output: {
//           manualChunks(id) {
//               if (
//                   id.includes('node_modules/three/') ||
//                   id.includes('node_modules\\three\\')
//               ) {
//                   return 'three-vendor'
//               }
//               return undefined
//           },
//       },
//     },
//   },
// })

// // mode 3 non manual chunk?
// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//   ],
// })

// C:\msys64\home\faris\projects\3js_tsc\tabel-periodik\vite.config.ts