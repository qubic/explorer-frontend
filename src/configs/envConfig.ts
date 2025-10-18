type EnvConfig = {
  NETWORK: string
  QLI_API_URL: string
  QUBIC_RPC_URL: string
  STATIC_API_URL: string
  TURNSTILE_SITE_KEY: string
}

export const envConfig: EnvConfig = {
  NETWORK: import.meta.env.VITE_NETWORK,
  QLI_API_URL: import.meta.env.VITE_QLI_API_URL,
  QUBIC_RPC_URL: import.meta.env.VITE_QUBIC_RPC_URL,
  STATIC_API_URL: import.meta.env.VITE_STATIC_API_URL,
  TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY
}

export default envConfig
