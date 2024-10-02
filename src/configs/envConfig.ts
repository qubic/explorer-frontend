type EnvConfig = {
  QLI_API_URL: string
  ARCHIVER_API_URL: string
  QUBIC_API_URL: string
  METRICS_API_URL: string
}

export const envConfig: EnvConfig = {
  QLI_API_URL: import.meta.env.VITE_QLI_API_URL,
  ARCHIVER_API_URL: import.meta.env.VITE_ARCHIVER_API_URL,
  QUBIC_API_URL: import.meta.env.VITE_QUBIC_API_URL,
  METRICS_API_URL: import.meta.env.VITE_QUBIC_METRICS_API_URL
}

export default envConfig
