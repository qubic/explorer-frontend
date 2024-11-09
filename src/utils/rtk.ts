import type { SerializedError } from '@reduxjs/toolkit'
import type { BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Formats RTK Query errors into a human-readable message.
 *
 * @param error - The error object returned by RTK Query, which can be of type `FetchBaseQueryError`, `SerializedError`, or `undefined`.
 * @returns A formatted error message string to provide user-friendly feedback.
 */
export function formatRTKError(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) {
    return 'An unknown error occurred'
  }

  if ('status' in error) {
    if (typeof error.data === 'object' && error.data !== null) {
      const { message } = error.data as { message?: string }
      return message || 'An error occurred while processing your request'
    }
    return `Error ${error.status}: ${JSON.stringify(error.data) || 'Unknown error'}`
  }

  return 'An unexpected error occurred'
}

/**
 * Creates a custom base query with a configurable base URL and formatted error handling for RTK Query.
 *
 * @param baseUrl - The base URL to use for all requests made by this query function.
 * @returns A `BaseQueryFn` that wraps `fetchBaseQuery` with additional error formatting logic.
 */
export const makeCustomBaseQuery = (
  baseUrl: string
): BaseQueryFn<
  string | { url: string; method?: string; body?: unknown },
  unknown,
  FetchBaseQueryError | SerializedError
> => {
  return async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery({ baseUrl })
    const result = await baseQuery(args, api, extraOptions)

    if (result.error) {
      const formattedError = formatRTKError(result.error)
      return { error: { status: result.error.status, message: formattedError } }
    }

    return result
  }
}
