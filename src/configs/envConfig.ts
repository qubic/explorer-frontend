type EnvConfig = {
  QLI_API_URL: string
  ARCHIVER_API_URL: string
  QX_API_URL: string
}

export const envConfig: EnvConfig = {
  QLI_API_URL: import.meta.env.VITE_QLI_API_URL,
  ARCHIVER_API_URL: import.meta.env.VITE_ARCHIVER_API_URL,
  QX_API_URL: import.meta.env.VITE_QX_API_URL
}

export default envConfig
