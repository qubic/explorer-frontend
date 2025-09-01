import { Turnstile as TurnstileWidget } from '@marsidev/react-turnstile'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { envConfig } from '../../configs/envConfig'
import type { AppDispatch, RootState } from '../../store'
import { clearToken, setError, setLoading, setToken } from '../../store/turnstileSlice'

interface TurnstileProps {
  onVerify?: (token: string) => void
  onError?: (error: string) => void
  onExpire?: () => void
  className?: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact' | 'invisible'
  autoResetOnExpire?: boolean
}

export function Turnstile({
  onVerify,
  onError,
  onExpire,
  className = '',
  theme = 'auto',
  size = 'normal',
  autoResetOnExpire = true
}: TurnstileProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { token, isLoading, error, isVerified } = useSelector((state: RootState) => state.turnstile)

  const handleVerify = useCallback(
    (turnstileToken: string) => {
      dispatch(setToken(turnstileToken))
      onVerify?.(turnstileToken)
    },
    [dispatch, onVerify]
  )

  const handleError = useCallback(
    (turnstileError: string) => {
      dispatch(setError(turnstileError))
      onError?.(turnstileError)
    },
    [dispatch, onError]
  )

  const handleExpire = useCallback(() => {
    if (autoResetOnExpire) {
      dispatch(clearToken())
    }
    onExpire?.()
  }, [dispatch, onExpire, autoResetOnExpire])

  const handleLoad = useCallback(() => {
    dispatch(setLoading(false))
  }, [dispatch])

  useEffect(() => {
    dispatch(setLoading(true))
  }, [dispatch])

  if (!envConfig.TURNSTILE_SITE_KEY) {
    // eslint-disable-next-line no-console
    console.warn('Turnstile site key not configured - widget will not render')
    return null
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <TurnstileWidget
        siteKey={envConfig.TURNSTILE_SITE_KEY}
        onSuccess={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        onWidgetLoad={handleLoad}
        options={{ theme, size }}
      />

      {isLoading && <div className="mt-2 text-sm text-gray-500">Loading verification...</div>}

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

      {isVerified && token && (
        <div className="text-green-500 mt-2 text-sm">✓ Verification successful</div>
      )}
    </div>
  )
}

export default Turnstile
