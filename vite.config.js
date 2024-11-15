import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173',  // backend server URL
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')  // remove "/api" from requests
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/lowcodeGPT"
})