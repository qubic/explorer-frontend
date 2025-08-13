import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { clearToken, resetTurnstile, setError, setToken } from '../store/turnstileSlice'

export const useTurnstile = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { token, isLoading, error, isVerified, lastVerifiedAt } = useSelector(
    (state: RootState) => state.turnstile
  )

  const verify = useCallback(
    (newToken: string) => {
      dispatch(setToken(newToken))
    },
    [dispatch]
  )

  const setErrorState = useCallback(
    (err: string) => {
      dispatch(setError(err))
    },
    [dispatch]
  )

  const clear = useCallback(() => {
    dispatch(clearToken())
  }, [dispatch])

  const reset = useCallback(() => {
    dispatch(resetTurnstile())
  }, [dispatch])

  const isTokenValid = useCallback(() => {
    if (!token || !lastVerifiedAt) return false

    // Turnstile tokens are typically valid for 5 minutes (300 seconds)
    const tokenAge = Date.now() - lastVerifiedAt
    const maxAge = 5 * 60 * 1000 // 5 minutes in milliseconds

    return tokenAge < maxAge
  }, [token, lastVerifiedAt])

  const getTokenAge = useCallback(() => {
    if (!lastVerifiedAt) return null
    return Date.now() - lastVerifiedAt
  }, [lastVerifiedAt])

  return {
    // State
    token,
    isLoading,
    error,
    isVerified,
    lastVerifiedAt,

    // Actions
    verify,
    setError: setErrorState,
    clear,
    reset,

    // Utilities
    isTokenValid,
    getTokenAge
  }
}
