import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArrowDownTrayIcon, ChevronDownIcon } from '@app/assets/icons'
import { Select, Tooltip } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { CopyTextButton } from '@app/components/ui/buttons'
import { clsxTwMerge, formatHex } from '@app/utils'
import type { DecodedContractInput } from '@app/utils/contract-input-decoder'
import SubCardItem from '../SubCardItem'
import DecodedInputTable from './DecodedInputTable'
import type { TxItemVariant } from './TxItem.types'

type ViewMode = 'default' | 'json' | 'hex' | 'base64'

const JSON_OPTION: Option<ViewMode> = { label: 'JSON', value: 'json' }
const HEX_OPTION: Option<ViewMode> = { label: 'Hex', value: 'hex' }
const BASE64_OPTION: Option<ViewMode> = { label: 'Base64', value: 'base64' }

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
  const [viewMode, setViewMode] = useState<ViewMode>(shouldDecodeInput ? 'default' : 'hex')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputDataHex = useMemo(() => formatHex(inputData ?? undefined), [inputData])

  const decodedInputJson = useMemo(() => {
    if (!decodedInput || decodedInput.status !== 'decoded') return null
    return JSON.stringify(decodedInput.value, null, 2)
  }, [decodedInput])

  const isDecodedView = viewMode === 'default' || viewMode === 'json'

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

  const selectedOption = useMemo(
    () => viewModeOptions.find((o) => o.value === viewMode) ?? viewModeOptions[0],
    [viewModeOptions, viewMode]
  )

  const selectWidth = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'auto'
    ctx.font = '12px "Space Mono", monospace'
    const maxLabelWidth = Math.max(...viewModeOptions.map((o) => ctx.measureText(o.label).width))
    return `${Math.ceil(maxLabelWidth) + 48}px`
  }, [viewModeOptions])

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
    if (contentRef.current && !isExpanded) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [decodedInputJson, viewMode, isExpanded])

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
            <p className="text-gray-40 mt-8 break-all font-space text-xs">{decodedInput.message}</p>
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
                  onSelect={(option) => setViewMode(option.value)}
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
