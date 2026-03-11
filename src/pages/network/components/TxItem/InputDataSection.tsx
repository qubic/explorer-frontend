import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { ArrowDownTrayIcon, ChevronDownIcon } from '@app/assets/icons'
import { Select, Tooltip } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { CopyTextButton } from '@app/components/ui/buttons'
import { clsxTwMerge, formatHex } from '@app/utils'
import type { DecodedContractInput } from '@app/utils/contract-input-decoder'
import SubCardItem from '../SubCardItem'
import DecodedInputTable from './DecodedInputTable'
import type { TxItemVariant } from './TxItem.types'

// Global param name is safe: InputDataSection only renders when showExtendedDetails=true,
// which only happens on the single-transaction detail page (TxPage, variant="secondary").
const DATA_VIEW_PARAM = 'dataView'
const VIEW_MODES = ['default', 'json', 'hex', 'base64'] as const
type ViewMode = (typeof VIEW_MODES)[number]

const OVERFLOW_TOLERANCE = 4
const JSON_OPTION: Option<ViewMode> = { label: 'JSON', value: 'json' }
const HEX_OPTION: Option<ViewMode> = { label: 'Hex', value: 'hex' }
const BASE64_OPTION: Option<ViewMode> = { label: 'Base64', value: 'base64' }

function isViewMode(value: string): value is ViewMode {
  return (VIEW_MODES as readonly string[]).includes(value)
}

function sanitizeViewMode(
  value: string | null,
  defaultMode: ViewMode,
  availableModes: ViewMode[]
): ViewMode {
  if (!value || !isViewMode(value) || !availableModes.includes(value)) return defaultMode
  return value
}

type Props = Readonly<{
  variant: TxItemVariant
  showExtendedDetails: boolean
  inputData: string | null | undefined
  shouldDecodeInput: boolean
  decodedInput: DecodedContractInput | null
  txHash: string
}>

export default function InputDataSection({
  variant,
  showExtendedDetails,
  inputData,
  shouldDecodeInput,
  decodedInput,
  txHash
}: Props) {
  const { t } = useTranslation('network-page')
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultMode: ViewMode = shouldDecodeInput ? 'default' : 'hex'
  const rawDataView = searchParams.get(DATA_VIEW_PARAM)

  const viewModeOptions: Option<ViewMode>[] = useMemo(
    () =>
      shouldDecodeInput
        ? [
            { label: t('defaultView'), value: 'default' as const },
            JSON_OPTION,
            HEX_OPTION,
            BASE64_OPTION
          ]
        : [HEX_OPTION, BASE64_OPTION],
    [shouldDecodeInput, t]
  )

  const availableModes = useMemo(() => viewModeOptions.map((o) => o.value), [viewModeOptions])
  const viewMode = sanitizeViewMode(rawDataView, defaultMode, availableModes)
  const isDecodedView = viewMode === 'default' || viewMode === 'json'

  const selectedOption = useMemo(
    () => viewModeOptions.find((o) => o.value === viewMode) ?? viewModeOptions[0],
    [viewModeOptions, viewMode]
  )

  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputDataHex = useMemo(() => formatHex(inputData ?? undefined), [inputData])

  const decodedInputJson = useMemo(() => {
    if (!decodedInput || decodedInput.status !== 'decoded') return null
    return JSON.stringify(decodedInput.value, null, 2)
  }, [decodedInput])

  const selectWidth = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'auto'
    ctx.font = '12px "Space Mono", monospace'
    const maxLabelWidth = Math.max(...viewModeOptions.map((o) => ctx.measureText(o.label).width))
    return `${Math.ceil(maxLabelWidth) + 48}px`
  }, [viewModeOptions])

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setSearchParams(
        (prev) => {
          if (mode === defaultMode) {
            prev.delete(DATA_VIEW_PARAM)
          } else {
            prev.set(DATA_VIEW_PARAM, mode)
          }
          return prev
        },
        { replace: true }
      )
    },
    [setSearchParams, defaultMode]
  )

  useEffect(() => {
    if (rawDataView && (!isViewMode(rawDataView) || !availableModes.includes(rawDataView))) {
      setSearchParams(
        (prev) => {
          prev.delete(DATA_VIEW_PARAM)
          return prev
        },
        { replace: true }
      )
    }
  }, [rawDataView, availableModes, setSearchParams])

  const handleExportJson = useCallback(() => {
    if (!decodedInputJson) return
    const blob = new Blob([decodedInputJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `decoded-input-data-${txHash}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }, [decodedInputJson, txHash])

  useEffect(() => {
    const el = contentRef.current
    if (!el || isExpanded) return undefined

    const checkOverflow = () => {
      setIsOverflowing(el.scrollHeight - el.clientHeight > OVERFLOW_TOLERANCE)
    }

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)
    checkOverflow()

    return () => observer.disconnect()
  }, [viewMode, isExpanded])

  if (!showExtendedDetails || !inputData || inputData.length === 0) return null

  const getCopyText = (): string => {
    if (isDecodedView && decodedInputJson) return decodedInputJson
    if (viewMode === 'hex') return `0x${inputDataHex}`
    return inputData ?? ''
  }

  const renderData = () => {
    if (isDecodedView && decodedInput) {
      if (decodedInput.status === 'decoded') {
        if (viewMode === 'default') {
          return <DecodedInputTable decoded={decodedInput} />
        }
        return <pre className="break-all font-space text-sm text-gray-50">{decodedInputJson}</pre>
      }
      return (
        <>
          <p className="break-all font-space text-sm text-gray-50">
            {t('unableToDecodeContractInput')}
          </p>
          {decodedInput.message && (
            <p className="mt-8 break-all font-space text-xs italic text-gray-50">
              {decodedInput.message}
            </p>
          )}
        </>
      )
    }

    return (
      <p className="break-all font-space text-sm text-gray-50">
        {viewMode === 'hex' ? `0x${inputDataHex}` : inputData}
      </p>
    )
  }

  return (
    <SubCardItem
      title={t('data')}
      variant={variant}
      content={
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-12 rounded-8 bg-primary-60 p-12">
            <div className="flex items-center gap-8">
              <div className="font-space text-xs" style={{ width: selectWidth }}>
                <Select
                  label={t('data')}
                  options={viewModeOptions}
                  defaultValue={selectedOption}
                  onSelect={(option) => handleViewModeChange(option.value)}
                  size="sm"
                />
              </div>
              <div className="ml-auto flex items-center gap-8">
                {viewMode !== 'default' && (
                  <CopyTextButton
                    text={getCopyText()}
                    className="border border-primary-60 p-7 text-white hover:bg-primary-60"
                  />
                )}
                {viewMode === 'json' && decodedInputJson && (
                  <Tooltip content={t('exportJson')} tooltipId="export-json">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="rounded-8 border border-primary-60 p-7 text-white hover:bg-primary-60"
                      aria-label={t('exportJson')}
                    >
                      <ArrowDownTrayIcon className="h-14 w-14" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
            <div
              ref={contentRef}
              className={clsxTwMerge('overflow-hidden', !isExpanded && 'max-h-[9rem]')}
            >
              {renderData()}
            </div>
            {(isExpanded || isOverflowing) && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center justify-center gap-6 self-center text-xs font-medium text-white hover:text-gray-50"
              >
                {isExpanded ? t('showLess') : t('showMore')}
                <ChevronDownIcon
                  className={clsxTwMerge(
                    'h-16 w-16 transition-transform duration-300',
                    isExpanded ? 'rotate-180' : 'rotate-0'
                  )}
                />
              </button>
            )}
          </div>
        </div>
      }
    />
  )
}
