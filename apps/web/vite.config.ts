import react from '@vitejs/plugin-react'

import analyze from 'rollup-plugin-analyzer'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), analyze()],
})
