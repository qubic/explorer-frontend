import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs, Select } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { Button } from '@app/components/ui/buttons'
import { PageLayout } from '@app/components/ui/layouts'
import { envConfig } from '@app/configs'
import { isValidAddressFormat, isValidQubicAddress } from '@app/utils'
import { HomeLink } from '../components'
import BetaBanner from '../components/BetaBanner'
import useCsvExport, {
  CSV_PAGE_SIZE,
  EVENTS_DATA_START_DATE,
  EVENTS_DATA_START_TICK
} from './useCsvExport'
import type { ExportType, RangeType } from './useCsvExport'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback': () => void
        }
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

function CsvExportPage() {
  const { t } = useTranslation('network-page')

  const exportTypeOptions: Option<ExportType>[] = [
    { label: t('transactions'), value: 'transactions' },
    { label: t('qubicTransfers'), value: 'qubicTransfers' },
    { label: t('tokenTransfers'), value: 'tokenTransfers' }
  ]

  const rangeTypes: { value: RangeType; label: string }[] = [
    { value: 'date', label: t('dateRange') },
    { value: 'tick', label: t('tickRange') }
  ]
  const [searchParams] = useSearchParams()
  const { download, isLoading, error, reset } = useCsvExport()

  const prefilledAddress = searchParams.get('address') ?? ''
  const [exportType, setExportType] = useState<ExportType>('transactions')
  const [address, setAddress] = useState(prefilledAddress)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [rangeType, setRangeType] = useState<RangeType>('date')
  const [startDate, setStartDate] = useState<string | undefined>()
  const [endDate, setEndDate] = useState<string | undefined>()
  const [startTick, setStartTick] = useState('')
  const [endTick, setEndTick] = useState('')

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const turnstileSiteKey = envConfig.TURNSTILE_SITE_KEY
  const captchaEnabled = !!turnstileSiteKey

  useEffect(() => {
    if (!captchaEnabled || !turnstileRef.current || widgetIdRef.current) return () => {}

    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null)
        })
      }
    }

    if (window.turnstile) {
      renderWidget()
      return () => {}
    }

    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval)
        renderWidget()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [captchaEnabled, turnstileSiteKey])

  const isEventsExport = exportType === 'qubicTransfers' || exportType === 'tokenTransfers'

  const [isValidatingAddress, setIsValidatingAddress] = useState(false)

  const validateAddress = useCallback(
    async (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) {
        setAddressError(null)
        return
      }
      if (!isValidAddressFormat(trimmed)) {
        setAddressError(t('invalidAddressFormat'))
        return
      }
      setIsValidatingAddress(true)
      try {
        const isValid = await isValidQubicAddress(trimmed)
        // Re-check that the field hasn't changed since validation started
        setAddress((current) => {
          if (current.trim() === trimmed) {
            setAddressError(isValid ? null : t('invalidAddressError'))
          }
          return current
        })
      } finally {
        setIsValidatingAddress(false)
      }
    },
    [t]
  )

  const handleExportTypeSelect = useCallback((option: Option<ExportType>) => {
    setExportType(option.value)
  }, [])

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setAddress(value)
    setAddressError(null)
  }, [])

  const handleAddressBlur = useCallback(() => {
    validateAddress(address)
  }, [address, validateAddress])

  const handleRangeTypeChange = useCallback((type: RangeType) => {
    setRangeType(type)
  }, [])

  const handleReset = useCallback(() => {
    setExportType('transactions')
    setAddress('')
    setAddressError(null)
    setRangeType('date')
    setStartDate(undefined)
    setEndDate(undefined)
    setStartTick('')
    setEndTick('')
    reset()
  }, [reset])

  const handleDownload = useCallback(() => {
    const trimmedAddress = address.trim()
    if (!trimmedAddress || !isValidAddressFormat(trimmedAddress)) return

    download({
      exportType,
      address: trimmedAddress,
      rangeType,
      startDate,
      endDate,
      startTick: startTick || undefined,
      endTick: endTick || undefined
    })
  }, [exportType, address, rangeType, startDate, endDate, startTick, endTick, download])

  const hasRequiredRange =
    rangeType === 'date' ? !!(startDate && endDate) : !!(startTick && endTick)

  const today = new Date().toISOString().slice(0, 10)
  const minDate = isEventsExport ? EVENTS_DATA_START_DATE : undefined
  const isDateRangeInvalid = rangeType === 'date' && !!startDate && !!endDate && startDate > endDate
  const isTickRangeInvalid =
    rangeType === 'tick' && !!startTick && !!endTick && Number(startTick) > Number(endTick)
  const isDateInFuture =
    rangeType === 'date' && ((!!startDate && startDate > today) || (!!endDate && endDate > today))
  const isDateBeforeAvailability =
    rangeType === 'date' &&
    !!minDate &&
    ((!!startDate && startDate < minDate) || (!!endDate && endDate < minDate))
  let rangeError: string | null = null
  if (isDateInFuture) rangeError = t('dateInFuture')
  else if (isDateBeforeAvailability && minDate)
    rangeError = t('dateBeforeAvailability', { date: minDate } as Record<string, string>)
  else if (isDateRangeInvalid) rangeError = t('invalidDateRange')
  else if (isTickRangeInvalid) rangeError = t('invalidTickRange')

  const canDownload =
    exportType &&
    address.trim() &&
    !addressError &&
    !isValidatingAddress &&
    hasRequiredRange &&
    !rangeError &&
    !isLoading &&
    (!captchaEnabled || captchaToken)

  return (
    <PageLayout>
      <Breadcrumbs>
        <HomeLink />
        <p className="font-sans text-xs text-primary-30">{t('csvExportTitle')}</p>
      </Breadcrumbs>

      <div className="mx-auto flex max-w-[600px] flex-col gap-20">
        <h1 className="mt-16 font-space text-2xl font-500">{t('csvExportPageTitle')}</h1>
        {/* Export Type */}
        <Select
          label={t('exportType')}
          options={exportTypeOptions}
          onSelect={handleExportTypeSelect}
          showLabel
          defaultValue={exportTypeOptions.find((o) => o.value === exportType)}
        />

        {/* Beta Banner for events-based exports */}
        {isEventsExport && <BetaBanner />}

        {/* Address */}
        <div>
          <label htmlFor="csv-export-address" className="mb-6 block text-sm text-gray-400">
            {t('address')} *
          </label>
          <input
            id="csv-export-address"
            type="text"
            value={address}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
            placeholder={t('addressPlaceholder')}
            autoComplete="off"
            className="w-full rounded bg-primary-60 px-10 py-6 font-space text-sm text-white placeholder:text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
          />
          {addressError && <p className="mt-4 text-xs text-error-40">{addressError}</p>}
        </div>

        {/* Range Type Toggle */}
        <div>
          <span className="mb-6 block text-sm text-gray-400">{t('rangeType')}</span>
          {isEventsExport && (
            <p className="-mt-4 mb-6 text-xs text-gray-50">
              {t('csvExportDataAvailability', {
                tick: EVENTS_DATA_START_TICK.toLocaleString()
              } as Record<string, string>)}
            </p>
          )}
          <div className="flex gap-2 rounded-md border border-primary-60 p-2">
            {rangeTypes.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRangeTypeChange(value)}
                className={`flex-1 rounded-md px-12 py-6 text-sm font-500 transition-colors ${
                  rangeType === value
                    ? 'bg-primary-60 text-primary-30'
                    : 'text-gray-50 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Range Fields */}
        {rangeType === 'date' ? (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
            <div>
              <label htmlFor="csv-export-start-date" className="mb-4 block text-xs text-gray-50">
                {t('startDate')} *
              </label>
              <input
                id="csv-export-start-date"
                type="date"
                value={startDate ?? ''}
                min={minDate}
                max={today}
                onChange={(e) => setStartDate(e.target.value || undefined)}
                className={`w-full cursor-pointer rounded bg-primary-60 px-10 py-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary-30 [&::-webkit-calendar-picker-indicator]:invert ${
                  startDate
                    ? 'text-white [&::-webkit-calendar-picker-indicator]:opacity-100'
                    : 'text-gray-50 [&::-webkit-calendar-picker-indicator]:opacity-50'
                }`}
              />
            </div>
            <div>
              <label htmlFor="csv-export-end-date" className="mb-4 block text-xs text-gray-50">
                {t('endDate')} *
              </label>
              <input
                id="csv-export-end-date"
                type="date"
                value={endDate ?? ''}
                min={minDate}
                max={today}
                onChange={(e) => setEndDate(e.target.value || undefined)}
                className={`w-full cursor-pointer rounded bg-primary-60 px-10 py-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary-30 [&::-webkit-calendar-picker-indicator]:invert ${
                  endDate
                    ? 'text-white [&::-webkit-calendar-picker-indicator]:opacity-100'
                    : 'text-gray-50 [&::-webkit-calendar-picker-indicator]:opacity-50'
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
            <div>
              <label htmlFor="csv-export-start-tick" className="mb-4 block text-xs text-gray-50">
                {t('startTick')} *
              </label>
              <input
                id="csv-export-start-tick"
                type="text"
                inputMode="numeric"
                value={startTick}
                onChange={(e) => setStartTick(e.target.value.replace(/\D/g, ''))}
                placeholder={t('startTick')}
                className="w-full rounded bg-primary-60 px-10 py-6 font-space text-sm text-white placeholder:text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
              />
            </div>
            <div>
              <label htmlFor="csv-export-end-tick" className="mb-4 block text-xs text-gray-50">
                {t('endTick')} *
              </label>
              <input
                id="csv-export-end-tick"
                type="text"
                inputMode="numeric"
                value={endTick}
                onChange={(e) => setEndTick(e.target.value.replace(/\D/g, ''))}
                placeholder={t('endTick')}
                className="w-full rounded bg-primary-60 px-10 py-6 font-space text-sm text-white placeholder:text-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
              />
            </div>
          </div>
        )}

        {/* Range Error */}
        {rangeError && <p className="text-xs text-error-40">{rangeError}</p>}

        {/* Error Message */}
        {error && (
          <p className="break-words text-sm text-error-40">
            {error === 'csvExportNoData' || error === 'csvExportError' ? t(error) : error}
          </p>
        )}

        {/* Limit Note */}
        <div className="flex items-center gap-6 text-xs text-gray-50">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gray-50 text-[10px] font-500">
            ?
          </span>
          <p>
            {t('csvExportLimit', { count: CSV_PAGE_SIZE.toLocaleString() } as Record<
              string,
              string
            >)}
          </p>
        </div>

        {/* Captcha */}
        {captchaEnabled && (
          <div className="flex flex-col gap-12">
            <p className="text-xs text-gray-50">{t('csvExportCaptchaDisclaimer')}</p>
            <div ref={turnstileRef} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-12">
          <Button
            variant="filled"
            color="primary"
            size="sm"
            onClick={handleDownload}
            disabled={!canDownload}
            isLoading={isLoading}
            loadingText={t('loading')}
          >
            {t('download')}
          </Button>
          <Button variant="outlined" color="primary" size="sm" onClick={handleReset}>
            {t('resetFilters')}
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}

const CsvExportPageWithHelmet = withHelmet(CsvExportPage, {
  title: 'CSV Export | Qubic Explorer',
  meta: [{ name: 'description', content: 'Export Qubic blockchain data to CSV' }]
})

export default CsvExportPageWithHelmet
