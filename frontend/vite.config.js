import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://recipebox-backend.onrender.com', // Yahan apna Render URL daalein
        changeOrigin: true,
        secure: false, // Kabhi-kabhi https ke liye ye zaroori hota hai
      }
    }
  }
})