import { envConfig } from '@app/configs'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { tokenManager } from './qli.auth'

/**
 * Creates a configured `fetchBaseQuery` instance with the provided token.
 *
 * @param token - The authorization token to include in the headers.
 * @returns A `fetchBaseQuery` function preconfigured with the token in headers.
 */
const makeBaseQuery = (token: string) =>
  fetchBaseQuery({
    baseUrl: envConfig.QLI_API_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${token}`)
      return headers
    }
  })

/**
 * Normalizes query arguments to ensure compatibility with `fetchBaseQuery`.
 *
 * @param args - The query arguments, either a string (URL) or a `FetchArgs` object.
 * @returns Normalized `FetchArgs` object.
 */
const normalizeArgs = (args: string | FetchArgs): FetchArgs =>
  typeof args === 'string' ? { url: args } : args

/**
 * A base query function for the QLI API, with automatic token handling and retry on 401 errors.
 *
 * @param args - The arguments for the fetch query, including the URL and optional headers/body.
 * @param api - The RTK Query API instance, used for additional functionality like dispatching actions.
 * @param extraOptions - Additional options passed to the query, typically unused in simple configurations.
 * @returns A promise that resolves with the result of the API request or rejects with an error.
 *
 * @throws Will rethrow errors other than 401 and handle authentication retries for 401 errors.
 */
export const qliBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Fetch the token if not already available
  const token = await tokenManager.getToken()

  const result = await makeBaseQuery(token)(normalizeArgs(args), api, extraOptions)

  // Check if the error is related to authentication
  if (result.error?.status === 401) {
    // Clearing invalid token
    tokenManager.clearToken()
    // Fetching new token
    const newToken = await tokenManager.getToken()

    return makeBaseQuery(newToken)(normalizeArgs(args), api, extraOptions)
  }

  return result
}

export default qliBaseQuery
