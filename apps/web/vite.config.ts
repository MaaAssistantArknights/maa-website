import react from '@vitejs/plugin-react'

import path from 'path'
import analyze from 'rollup-plugin-analyzer'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    ...[process.env.VITE_ENABLE_ANALYZER === 'true' && analyze()],
  ],
  server: {
    port: 3000,
  },
})
