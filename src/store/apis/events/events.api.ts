import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { envConfig } from '@app/configs'
import type { RawGetEventsResponse, TransactionEvent } from './events.types'
import { adaptApiEvent } from './events.types'

const BASE_URL = `${envConfig.EVENTS_API_URL}/query/v1`

export interface PaginatedEvents {
  events: TransactionEvent[]
  total: number
}

export interface GetEventsByTickRequest {
  tickNumber: number
  offset?: number
  size?: number
  eventType?: number
}

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    getEventsByTxHash: builder.query<TransactionEvent[], string>({
      query: (txHash) => ({
        url: '/getEvents',
        method: 'POST',
        body: { filters: { transactionHash: txHash }, pagination: { size: 1000 } }
      }),
      transformResponse: (response: RawGetEventsResponse) =>
        (response?.events ?? []).flatMap((raw) => {
          try {
            return [adaptApiEvent(raw)]
          } catch {
            return []
          }
        })
    }),
    getEventsByTick: builder.query<PaginatedEvents, GetEventsByTickRequest>({
      query: ({ tickNumber, offset = 0, size = 25, eventType }) => ({
        url: '/getEvents',
        method: 'POST',
        body: {
          filters: {
            tickNumber: String(tickNumber),
            ...(eventType !== undefined && { eventType: String(eventType) })
          },
          pagination: { offset, size }
        }
      }),
      transformResponse: (response: RawGetEventsResponse) => ({
        events: (response?.events ?? []).flatMap((raw) => {
          try {
            return [adaptApiEvent(raw)]
          } catch {
            return []
          }
        }),
        total: response?.hits?.total ?? 0
      })
    })
  })
})

export const { useGetEventsByTxHashQuery, useGetEventsByTickQuery } = eventsApi
