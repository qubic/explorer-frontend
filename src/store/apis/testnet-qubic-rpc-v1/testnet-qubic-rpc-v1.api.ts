import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { NetworkStatus } from './testnet-qubic-rpc-v1.types'

const BASE_URL = `https://testnet-rpc.qubic.org/v1/node-info/v1`

export const testnetQubicRpcV1 = createApi({
  reducerPath: 'testnetQubicRpcV1',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    // This endpoint it's just available for the testnet, that's why it's a separate API with hardcoded BASE_URL
    getNodesInfo: build.query<NetworkStatus, void>({
      query: () => '/node-info'
    })
  })
})

export const { useGetNodesInfoQuery } = testnetQubicRpcV1
