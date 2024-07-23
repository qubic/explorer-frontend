import { GlobeGrayIcon } from '@app/assets/icons'
import { LANGUAGES } from '@app/constants/i18n'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { selectLocale, setLanguage } from '@app/store/localeSlice'
import { Language } from '@app/types'
import { clsxTwMerge } from '@app/utils'
import { useEffect, useRef, useState } from 'react'
import DropdownMenu from './DropdownMenu'

export default function LanguagePicker() {
  const dispatch = useAppDispatch()
  const { language } = useAppSelector(selectLocale)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const handleDropdownToggle = () => setShowDropdown((prev) => !prev)

  const handleLanguageChange = (lng: Language) => {
    dispatch(setLanguage(lng.id))
    handleDropdownToggle()
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <DropdownMenu show={showDropdown}>
      <DropdownMenu.Trigger
        onToggle={handleDropdownToggle}
        className="hover:bg-gray-70/80 p-8 rounded-full"
      >
        <GlobeGrayIcon className="w-24 h-24 " />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <ul className="grid" ref={dropdownRef}>
          {LANGUAGES.map((lng, index) => (
            <li key={lng.id}>
              <button
                type="button"
                onClick={() => handleLanguageChange(lng)}
                className={clsxTwMerge(
                  'text-left px-16 py-10 w-full hover:bg-gray-60/40 font-space min-w-[164px] leading-tight',
                  language === lng.id && 'bg-gray-60/60',
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
  )
}