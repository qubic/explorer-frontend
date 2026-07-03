import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { QUERY_CACHE_TIME } from '@app/constants'
import { envConfig } from '@app/configs'
import type {
  GetSmartContractRewardsRequest,
  RawGetSmartContractRewardsResponse,
  SmartContractRewards
} from './aggregation.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}/aggregation/v1`

function adaptRewards(response: RawGetSmartContractRewardsResponse): SmartContractRewards {
  const validForTick = response?.validForTick
  return {
    total: response?.hits?.total ?? 0,
    smartContractAddress: response?.smartContractAddress ?? '',
    totalAllTimeDistributed: response?.totalAllTimeDistributed ?? '0',
    distributions: response?.distributions ?? [],
    validForTick:
      typeof validForTick === 'number' && Number.isFinite(validForTick) ? validForTick : undefined
  }
}

export const aggregationApi = createApi({
  reducerPath: 'aggregationApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  keepUnusedDataFor: QUERY_CACHE_TIME,
  endpoints: (builder) => ({
    getSmartContractRewards: builder.query<SmartContractRewards, GetSmartContractRewardsRequest>({
      query: ({ smartContractAddress, pagination }) => ({
        url: '/getSmartContractRewards',
        method: 'POST',
        body: {
          smartContractAddress,
          pagination: {
            offset: pagination?.offset ?? 0,
            size: pagination?.size ?? 100
          }
        }
      }),
      transformResponse: adaptRewards
    })
  })
})

export const { useGetSmartContractRewardsQuery } = aggregationApi
