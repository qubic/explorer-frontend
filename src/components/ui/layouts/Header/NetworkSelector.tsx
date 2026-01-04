import { useState } from 'react'

import { QubicWhiteLogo } from '@app/assets/icons'
import { Alert, DropdownMenu } from '@app/components/ui'
import { ErrorBoundary } from '@app/components/ui/error-boundaries'
import { envConfig } from '@app/configs'
import { EXPLORER_NETWORK_URLS } from '@app/constants/qubic'
import { clsxTwMerge } from '@app/utils'

export default function NetworkSelector() {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleDropdownToggle = () => setShowDropdown((prev) => !prev)

  return (
    <ErrorBoundary fallback={<Alert variant="error" className="mx-5 my-2.5" />}>
      <DropdownMenu show={showDropdown} onToggle={handleDropdownToggle}>
        <DropdownMenu.Trigger className="rounded-full p-8 transition-colors duration-500 ease-in-out hover:bg-card">
          <QubicWhiteLogo className="size-28 shrink-0 rounded border border-border p-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="ltr:left-auto ltr:right-0">
          <ul className="grid gap-2 p-10">
            {Object.values(EXPLORER_NETWORK_URLS).map(({ networkId, label, url }) => (
              <li key={networkId} className="flex">
                <a
                  href={url}
                  className={clsxTwMerge(
                    'w-full min-w-92 p-8 text-left font-space text-sm leading-tight first:rounded-t-md last:rounded-b-md hover:bg-muted',
                    envConfig.NETWORK === networkId && 'text-primary-30'
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </DropdownMenu.Content>
      </DropdownMenu>
    </ErrorBoundary>
  )
}
