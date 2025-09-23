/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_PROXY: string
  readonly VITE_NETWORK: string
  readonly VITE_QLI_API_URL: string
  readonly VITE_QUBIC_RPC_URL: string
  readonly VITE_STATIC_API_URL: string
  readonly VITE_QUERY_SERVICE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
declare const __APP_VERSION__: string
