import { envConfig } from '@app/configs'
import type { ReactNode } from 'react'
import { Turnstile } from '../ui'

interface TurnstileProviderProps {
  children: ReactNode
}

export function TurnstileProvider({ children }: TurnstileProviderProps) {
  if (!envConfig.TURNSTILE_SITE_KEY || import.meta.env.MODE === 'development') {
    // eslint-disable-next-line no-console
    console.warn('Turnstile not configured - skipping verification')
    return children
  }

  return (
    <>
      {/* Invisible Turnstile widget for app-wide protection */}
      <div className="pointer-events-none fixed left-0 top-0 z-[-1] opacity-0">
        <Turnstile size="invisible" theme="dark" />
      </div>
      {children}
    </>
  )
}

export default TurnstileProvider
