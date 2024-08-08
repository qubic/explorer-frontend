/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_QLI_API_URL: string
  readonly VITE_ARCHIVER_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
