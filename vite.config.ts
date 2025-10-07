import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/prosurf_tma/',
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
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
    // Inline assets smaller than 4KB for better performance
    assetsInlineLimit: 0,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Minification options
    minify: 'esbuild',

    // Source maps for production debugging (optional - can be disabled for smaller builds)
    sourcemap: false,

    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Optimize chunk size
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks(id) {
          // Vendor chunks - node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('@telegram-apps/telegram-ui')) {
              return 'telegram-vendor';
            }
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            // Other node_modules
            return 'vendor';
          }

          // Source code chunks
          if (id.includes('src/shared/api/')) {
            return 'api';
          }
          if (id.includes('src/shared/ui/')) {
            return 'ui-components';
          }
        },

        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/\.css$/i.test(assetInfo.name ?? '')) {
            return `assets/css/[name]-[hash][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
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
