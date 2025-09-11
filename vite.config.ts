import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'rarely-fervent-amphibian.cloudpub.ru'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // Disable inlining svg icon as Base64
    assetsInlineLimit: 0,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/shared/lib/style-utils" as utils;\n'
          + '@use "@/shared/ds" as ds;\n',
      },
    },
  },
})
