import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GetTransactionsForIdentityRequest, QueryServiceResponse } from './query-service.types'

const BASE_URL = `${envConfig.QUERY_SERVICE_URL}`

export const queryServiceApi = createApi({
  reducerPath: 'queryServiceApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    getTransactionsForIdentity: builder.mutation<
      QueryServiceResponse,
      GetTransactionsForIdentityRequest
    >({
      query: (body) => ({
        url: '/getTransactionsForIdentity',
        method: 'POST',
        body
      })
    })
  })
})

export const { useGetTransactionsForIdentityMutation } = queryServiceApi
