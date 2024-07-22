type EnvConfig = {
  QLI_API_URL: string
  ARCHIVER_API_URL: string
}

const envConfig: EnvConfig = {
  QLI_API_URL: import.meta.env.VITE_QLI_API_URL,
  ARCHIVER_API_URL: import.meta.env.VITE_ARCHIVER_API_URL
}

export default envConfig
