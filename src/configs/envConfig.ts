type EnvConfig = {
  NETWORK: string
  QUBIC_RPC_URL: string
  STATIC_API_URL: string
}

export const envConfig: EnvConfig = {
  NETWORK: import.meta.env.VITE_NETWORK,
  QUBIC_RPC_URL: import.meta.env.VITE_QUBIC_RPC_URL,
  STATIC_API_URL: import.meta.env.VITE_STATIC_API_URL
}

export default envConfig
