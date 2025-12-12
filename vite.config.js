import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 注意：因为你的仓库名是以 .github.io 结尾的，这里必须是 '/'
  base: '/', 
})