/**
 * Vite Configuration for Google/Facebook-Level Performance
 * Optimized code splitting, chunking, and tree shaking
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize React runtime
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ]
      }
    })
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@router': path.resolve(__dirname, './src/router')
    }
  },

  // Build optimization
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: false,
    
    // Minify with terser for better compression
    minify: 'terser',
    
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false
      }
    },

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting strategy (Google/Facebook pattern)
        manualChunks: (id) => {
          // Vendor chunk - node_modules
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Redux
            if (id.includes('redux') || id.includes('@reduxjs')) {
              return 'vendor-redux';
            }
            
            // PDF libraries
            if (id.includes('pdfjs') || id.includes('pdf')) {
              return 'vendor-pdf';
            }
            
            // Excel libraries
            if (id.includes('xlsx') || id.includes('excel')) {
              return 'vendor-excel';
            }
            
            // Bootstrap/UI
            if (id.includes('bootstrap') || id.includes('react-bootstrap')) {
              return 'vendor-ui';
            }
            
            // Tesseract OCR
            if (id.includes('tesseract')) {
              return 'vendor-ocr';
            }
            
            // Other vendors
            return 'vendor-libs';
          }

          // Core utilities
          if (id.includes('/src/core/')) {
            return 'core';
          }

          // Redux slices
          if (id.includes('/src/redux-slice/')) {
            return 'redux-slices';
          }

          // Components
          if (id.includes('/src/components/')) {
            // Dashboard components
            if (id.includes('Dashboard')) {
              return 'components-dashboard';
            }
            // Valuation components
            if (id.includes('Valuation')) {
              return 'components-valuation';
            }
            // Common components
            return 'components-common';
          }

          // Pages - Split by major feature
          if (id.includes('/src/pages/')) {
            if (id.includes('Dashboard')) {
              return 'pages-dashboard';
            }
            if (id.includes('Valuation')) {
              return 'pages-valuation';
            }
            if (id.includes('Excel')) {
              return 'pages-excel';
            }
            if (id.includes('Pdf')) {
              return 'pages-pdf';
            }
            return 'pages-misc';
          }
        },

        // Chunk file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },

        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js',

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[ext]/[name]-[hash][extname]`;
        }
      }
    },

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },

  // Development server
  server: {
    port: 3000,
    host: true,
    open: false,
    cors: true,
    
    // Proxy API requests
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },

    // HMR options
    hmr: {
      overlay: true
    }
  },

  // Preview server (for production build testing)
  preview: {
    port: 3000,
    host: true,
    open: false
  },

  // Dependency optimization
  optimizeDeps: {
    // Include dependencies for pre-bundling
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
      'bootstrap'
    ],
    
    // Exclude from pre-bundling (loaded on demand)
    exclude: [
      'pdfjs-dist',
      'tesseract.js',
      'xlsx'
    ],

    // Force optimization
    force: false
  },

  // CSS options
  css: {
    devSourcemap: true,
    
    // CSS modules
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },

    // PostCSS config
    postcss: {
      plugins: []
    }
  },

  // Performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },

  // JSON optimization
  json: {
    namedExports: true,
    stringify: false
  }
});
