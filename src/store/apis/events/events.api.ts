import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { DEFAULT_PAGE_SIZE, QUERY_CACHE_TIME } from '@app/constants'
import { envConfig } from '@app/configs'
import type { RawGetEventsResponse, TransactionEvent } from './events.types'
import { adaptApiEvent } from './events.types'

const BASE_URL = `${envConfig.EVENTS_API_URL}/query/v1`

export interface PaginatedEvents {
  events: TransactionEvent[]
  total: number
  validForTick?: number
}

export interface ShouldFilter {
  terms?: Record<string, string>
  ranges?: Record<string, EventRange>
}

export interface EventRange {
  gte?: string
  lte?: string
}

export interface GetEventsRequest {
  tickNumber?: number
  transactionHash?: string
  logId?: number
  offset?: number
  size?: number
  logType?: number[]
  should?: ShouldFilter[]
  source?: string
  destination?: string
  excludeSource?: string
  excludeDestination?: string
  category?: number
  tickRange?: EventRange
  timestampRange?: EventRange
  amountRange?: EventRange
  numberOfSharesRange?: EventRange
  amount?: string
  numberOfShares?: string
}

function adaptEventsList(response: RawGetEventsResponse): TransactionEvent[] {
  return (response?.eventLogs ?? []).flatMap((raw) => {
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
    total: response?.hits?.total ?? 0,
    validForTick: response?.validForTick
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
        logId,
        offset = 0,
        size = DEFAULT_PAGE_SIZE,
        logType,
        category,
        should,
        source,
        destination,
        excludeSource,
        excludeDestination,
        tickRange,
        timestampRange,
        amountRange,
        numberOfSharesRange,
        amount,
        numberOfShares
      }) => {
        const filters: Record<string, string> = {
          ...(tickNumber !== undefined && { tickNumber: String(tickNumber) }),
          ...(transactionHash && { transactionHash }),
          ...(logId !== undefined && { logId: String(logId) }),
          ...(logType && logType.length > 0 && { logType: logType.join(',') }),
          ...(category !== undefined && { categories: String(category) }),
          ...(source && { source }),
          ...(destination && { destination }),
          ...(amount !== undefined && { amount }),
          ...(numberOfShares !== undefined && { numberOfShares })
        }

        const exclude: Record<string, string> = {
          ...(excludeSource && { source: excludeSource }),
          ...(excludeDestination && { destination: excludeDestination })
        }

        const ranges: Record<string, EventRange> = {
          ...(tickRange && { tickNumber: tickRange }),
          ...(timestampRange && { timestamp: timestampRange }),
          ...(amountRange && { amount: amountRange }),
          ...(numberOfSharesRange && { numberOfShares: numberOfSharesRange })
        }

        return {
          url: '/getEventLogs',
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
