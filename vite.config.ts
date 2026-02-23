import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import type { UserConfig } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import { eventsApiProxy, qliApiProxy, rpcApiProxy, staticApiProxy } from './dev-proxy.config'

const defaultConfig: UserConfig = {
  plugins: [
    react(),
    svgr(),
    visualizer({
      filename: './dist/stats.html',
      open: true
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  base: './',
  resolve: {
    alias: {
      '@app': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lottie: ['lottie-react'],
          qubicLib: ['@qubic-lib/qubic-ts-library']
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())

  if (command === 'serve' && (mode === 'development' || env.VITE_ENABLE_PROXY === 'true')) {
    return {
      ...defaultConfig,
      server: {
        proxy: {
          '/dev-proxy-qli-api': qliApiProxy,
          '/dev-proxy-rpc-api': rpcApiProxy,
          '/dev-proxy-static-api': staticApiProxy,
          '/dev-proxy-events-api': eventsApiProxy
        }
      }
    }
  }

  return defaultConfig
})
