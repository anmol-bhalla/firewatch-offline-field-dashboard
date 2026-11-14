import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/firewatch.svg'],
    manifest: {
      name: 'FireWatch Field Operations',
      short_name: 'FireWatch',
      description: 'Offline-first wildfire field observation dashboard.',
      theme_color: '#101b2d',
      background_color: '#f5f7f9',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [{ src: '/icons/firewatch.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      navigateFallback: 'index.html',
      runtimeCaching: [],
    },
  })],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
  },
})
