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

export interface ShouldFilter {
  terms?: Record<string, string>
}

export interface EventRange {
  gte?: string
  lte?: string
}

export interface GetEventsRequest {
  tickNumber?: number
  transactionHash?: string
  offset?: number
  size?: number
  logType?: number[]
  should?: ShouldFilter[]
  source?: string
  destination?: string
  excludeSource?: string
  excludeDestination?: string
  tickRange?: EventRange
  timestampRange?: EventRange
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
    getEvents: builder.query<PaginatedEvents, GetEventsRequest>({
      query: ({
        tickNumber,
        transactionHash,
        offset = 0,
        size = DEFAULT_PAGE_SIZE,
        logType,
        should,
        source,
        destination,
        excludeSource,
        excludeDestination,
        tickRange,
        timestampRange
      }) => {
        const filters: Record<string, string> = {
          ...(tickNumber !== undefined && { tickNumber: String(tickNumber) }),
          ...(transactionHash && { transactionHash }),
          ...(logType !== undefined && { logType: String(logType) }),
          ...(source && { source }),
          ...(destination && { destination })
        }

        const exclude: Record<string, string> = {
          ...(excludeSource && { source: excludeSource }),
          ...(excludeDestination && { destination: excludeDestination })
        }

        const ranges: Record<string, EventRange> = {
          ...(tickRange && { tickNumber: tickRange }),
          ...(timestampRange && { timestamp: timestampRange })
        }

        return {
          url: '/getEvents',
          method: 'POST',
          body: {
            filters,
            ...(Object.keys(exclude).length > 0 && { exclude }),
            ...(Object.keys(ranges).length > 0 && { ranges }),
            ...(should && { should }),
            pagination: { offset, size }
          }
        }
      },
      transformResponse: adaptPaginatedEvents
    })
  })
})

export const { useGetEventsQuery } = eventsApi
