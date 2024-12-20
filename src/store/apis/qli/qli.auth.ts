import { envConfig } from '@app/configs'
import axios from 'axios'
import type { GetUserResponse } from './qli.types'

const QLI_LOGIN_URL = `${envConfig.QLI_API_URL}/auth/login`
const TOKEN_STORAGE_KEY = 'qli_auth_token'

/**
 * Retrieves the token from persistent storage (e.g., localStorage).
 *
 * @returns The stored token or `null` if not present.
 */
const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Stores the token in persistent storage (e.g., localStorage).
 *
 * @param token - The authentication token to store.
 */
const storeToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/**
 * Removes the token from persistent storage.
 */
const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Fetches a new authentication token from the API.
 *
 * @returns The fetched token as a string.
 */
const fetchNewToken = async (): Promise<string> => {
  const response = await axios.post<GetUserResponse>(
    QLI_LOGIN_URL,
    {
      userName: 'guest@qubic.li',
      password: 'guest13@Qubic.li',
      twoFactorCode: ''
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  const { token } = response.data
  storeToken(token)
  return token
}

/**
 * A token manager for handling token retrieval and clearing.
 */
export const tokenManager = {
  /**
   * Retrieves the authentication token, fetching it if not already available.
   *
   * @returns The authentication token as a string.
   */
  getToken: async (): Promise<string> => {
    const token = getStoredToken()
    if (!token) {
      return fetchNewToken()
    }
    return token
  },

  /**
   * Clears the stored authentication token.
   */
  clearToken: (): void => {
    clearStoredToken()
  }
}

export default tokenManager
