import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { DEFAULT_PAGE_SIZE, QUERY_CACHE_TIME } from '@app/constants'
import { envConfig } from '@app/configs'
import type { RawGetEventsResponse, TransactionEvent } from './events.types'
import { adaptApiEvent } from './events.types'

const BASE_URL = `${envConfig.EVENTS_API_URL}/query/v1`

export interface PaginatedEvents {
  events: TransactionEvent[]
  total: number
}

export interface GetEventsRequest {
  tickNumber?: number
  offset?: number
  size?: number
  eventType?: number
}

function adaptEventsList(response: RawGetEventsResponse): TransactionEvent[] {
  return (response?.events ?? []).flatMap((raw) => {
    try {
      return [adaptApiEvent(raw)]
    } catch {
      return []
    }
  })
}

function adaptPaginatedEvents(response: RawGetEventsResponse): PaginatedEvents {
  return {
    events: adaptEventsList(response),
    total: response?.hits?.total ?? 0
  }
}

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  keepUnusedDataFor: QUERY_CACHE_TIME,
  endpoints: (builder) => ({
    getEventsByTxHash: builder.query<TransactionEvent[], string>({
      query: (txHash) => ({
        url: '/getEvents',
        method: 'POST',
        body: { filters: { transactionHash: txHash }, pagination: { size: 1000 } }
      }),
      transformResponse: adaptEventsList
    }),
    getEvents: builder.query<PaginatedEvents, GetEventsRequest>({
      query: ({ tickNumber, offset = 0, size = DEFAULT_PAGE_SIZE, eventType }) => ({
        url: '/getEvents',
        method: 'POST',
        body: {
          filters: {
            ...(tickNumber !== undefined && { tickNumber: String(tickNumber) }),
            ...(eventType !== undefined && { eventType: String(eventType) })
          },
          pagination: { offset, size }
        }
      }),
      transformResponse: adaptPaginatedEvents
    })
  })
})

export const { useGetEventsByTxHashQuery, useGetEventsQuery } = eventsApi
