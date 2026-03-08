import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
import { COPY_BUTTON_TYPES, CopyTextButton } from '@app/components/ui/buttons'
import { clsxTwMerge, formatHex } from '@app/utils'
import type { DecodedContractInput } from '@app/utils/contract-input-decoder'
import SubCardItem from '../SubCardItem'
import type { TxItemVariant } from './TxItem.types'

type InputFormat = 'decoded' | 'hex' | 'base64'

type Props = Readonly<{
  variant: TxItemVariant
  showExtendedDetails: boolean
  inputData: string | null | undefined
  shouldDecodeInput: boolean
  decodedInput: DecodedContractInput | null
}>

export default function InputDataSection({
  variant,
  showExtendedDetails,
  inputData,
  shouldDecodeInput,
  decodedInput
}: Props) {
  const { t } = useTranslation('network-page')
  const [inputDataFormat, setInputDataFormat] = useState<InputFormat>(
    shouldDecodeInput ? 'decoded' : 'hex'
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputDataHex = useMemo(() => formatHex(inputData ?? undefined), [inputData])

  const decodedInputJson = useMemo(() => {
    if (!decodedInput || decodedInput.status !== 'decoded') return null
    return JSON.stringify(decodedInput.value, null, 2)
  }, [decodedInput])

  useEffect(() => {
    if (contentRef.current && !isExpanded) {
      setIsOverflowing(contentRef.current.scrollHeight > contentRef.current.clientHeight)
    }
  }, [decodedInputJson, inputDataFormat, isExpanded])

  if (!showExtendedDetails || !inputData || inputData.length === 0) return null

  const formats: InputFormat[] = shouldDecodeInput
    ? ['decoded', 'hex', 'base64']
    : ['hex', 'base64']

  const FORMAT_LABELS: Record<InputFormat, string> = {
    decoded: 'Decoded',
    hex: 'Hex',
    base64: 'Base64'
  }

  const getCopyText = (): string => {
    if (inputDataFormat === 'decoded' && decodedInputJson) return decodedInputJson
    if (inputDataFormat === 'hex') return `0x${inputDataHex}`
    return inputData ?? ''
  }

  const renderData = () => {
    if (inputDataFormat === 'decoded' && decodedInput) {
      if (decodedInput.status === 'decoded') {
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
        {inputDataFormat === 'hex' ? `0x${inputDataHex}` : inputData}
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
            <div className="flex items-center justify-end gap-8">
              <CopyTextButton text={getCopyText()} type={COPY_BUTTON_TYPES.GENERIC} />
              <span className="inline-flex overflow-hidden rounded-8 border border-gray-50 bg-primary-80">
                {formats.map((format, index) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setInputDataFormat(format)}
                    className={clsxTwMerge(
                      'px-8 py-2 text-xs font-medium transition-colors',
                      index > 0 && 'border-l border-gray-50',
                      inputDataFormat === format
                        ? 'bg-primary-60 text-white'
                        : 'bg-transparent text-gray-50 hover:bg-primary-70 hover:text-white'
                    )}
                  >
                    {FORMAT_LABELS[format]}
                  </button>
                ))}
              </span>
            </div>
            <div
              ref={contentRef}
              className={clsxTwMerge('overflow-hidden', !isExpanded && 'max-h-[12rem]')}
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
