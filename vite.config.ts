// ini berhasil build
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/MY-first-threejs/',
})

// // Reminder: ini panicked Rust Pada saat build missmatch binary mungkin Oxide
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

// // mode 3 non manual chunk, masih juga gagal build panicked rust, MSYS missmatch
// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//   ],
// })
