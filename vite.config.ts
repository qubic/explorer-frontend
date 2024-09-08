import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import { archiverApiProxy, qliApiProxy } from './dev-proxy.config'

const defaultConfig: UserConfig = {
  plugins: [react(), svgr()],
  base: './',
  resolve: {
    alias: {
      '@app': '/src'
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
          '/dev-proxy-archiver-api': archiverApiProxy
        }
      }
    }
  }

  return defaultConfig
})
