import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Asset } from './qx.types'

const BASE_URL = `${envConfig.QX_API_URL}/v1/qx`

export const qxApi = createApi({
  reducerPath: 'qxApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    getAssets: build.query<Asset[], void>({
      query: () => '/assets'
    })
  })
})

export const { useGetAssetsQuery } = qxApi
