import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { clsxTwMerge, formatHex } from '@app/utils'
import SubCardItem from '../SubCardItem'
import type { TxItemVariant } from './TxItem.types'

type Props = Readonly<{
  variant: TxItemVariant
  showExtendedDetails: boolean
  inputData: string | null | undefined
}>

export default function InputDataSection({ variant, showExtendedDetails, inputData }: Props) {
  const { t } = useTranslation('network-page')
  const [inputDataFormat, setInputDataFormat] = useState<'base64' | 'hex'>('hex')
  const inputDataHex = useMemo(() => formatHex(inputData ?? undefined), [inputData])

  if (!showExtendedDetails || !inputData || inputData.length === 0) return null

  return (
    <SubCardItem
      title={t('data')}
      variant={variant}
      content={
        <div className="min-w-0 flex-1">
          <p className="break-all rounded-8 bg-primary-60 p-12 font-space text-sm text-gray-50">
            <span className="float-right mb-4 ml-8 inline-flex overflow-hidden rounded-8 border border-gray-50 bg-primary-80">
              {(['hex', 'base64'] as const).map((format, index) => (
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
                  {format === 'hex' ? 'Hex' : 'Base64'}
                </button>
              ))}
            </span>
            {inputDataFormat === 'hex' ? `0x${inputDataHex}` : inputData}
          </p>
        </div>
      }
    />
  )
}
