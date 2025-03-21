type EnvConfig = {
  NETWORK: string
  QLI_API_URL: string
  QUBIC_RPC_URL: string
  QX_API_URL: string
}

export const envConfig: EnvConfig = {
  NETWORK: import.meta.env.VITE_NETWORK,
  QLI_API_URL: import.meta.env.VITE_QLI_API_URL,
  QUBIC_RPC_URL: import.meta.env.VITE_QUBIC_RPC_URL,
  QX_API_URL: import.meta.env.VITE_QX_API_URL
}

export default envConfig
