import { useCallback, useState } from 'react'

import { GlobeGrayIcon } from '@app/assets/icons'
import { Alert, DropdownMenu } from '@app/components/ui'
import { ErrorBoundary } from '@app/components/ui/error-boundaries'
import { LANGUAGES } from '@app/constants/i18n'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { selectLocale, setLanguage } from '@app/store/localeSlice'
import type { Language } from '@app/types'
import { clsxTwMerge } from '@app/utils'

export default function LanguagePicker() {
  const dispatch = useAppDispatch()
  const { language } = useAppSelector(selectLocale)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleDropdownToggle = () => setShowDropdown((prev) => !prev)

  const handleLanguageChange = useCallback(
    (lng: Language) => {
      dispatch(setLanguage(lng.id))
      handleDropdownToggle()
    },
    [dispatch]
  )

  return (
    <ErrorBoundary fallback={<Alert variant="error" className="mx-5 my-2.5" />}>
      <DropdownMenu show={showDropdown} onToggle={handleDropdownToggle}>
        <DropdownMenu.Trigger className="rounded-full p-8 transition-colors duration-500 ease-in-out hover:bg-card">
          <GlobeGrayIcon className="h-18 w-18" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <ul className="grid">
            {LANGUAGES.map((lng, index) => (
              <li key={lng.id}>
                <button
                  type="button"
                  onClick={() => handleLanguageChange(lng)}
                  className={clsxTwMerge(
                    'w-full min-w-[164px] px-16 py-10 text-left font-space leading-tight hover:bg-muted',
                    language === lng.id && 'bg-muted',
                    index === 0 && 'rounded-t-md',
                    index === LANGUAGES.length - 1 && 'rounded-b-md'
                  )}
                >
                  {lng.label}
                </button>
              </li>
            ))}
          </ul>
        </DropdownMenu.Content>
      </DropdownMenu>
    </ErrorBoundary>
  )
}
