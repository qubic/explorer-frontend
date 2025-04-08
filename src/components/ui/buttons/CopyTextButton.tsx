import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckIcon, CopyTextIcon } from '@app/assets/icons'
import { clsxTwMerge, copyText } from '@app/utils'
import Tooltip from '../Tooltip'

type Props = {
  text: string
  className?: string
}

export default function CopyTextButton({ text, className }: Props) {
  const { t } = useTranslation('network-page')
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    copyText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <Tooltip content={isCopied ? t('copied') : t('copyToClipboard')} tooltipId="copy-text-button">
      <button
        type="button"
        className={clsxTwMerge(
          'flex items-center justify-center rounded-8 text-gray-50',
          isCopied ? 'hover:cursor-default' : 'hover:text-white',
          className
        )}
        onClick={handleCopy}
      >
        {isCopied ? (
          <CheckIcon className="size-14 text-success-40" />
        ) : (
          <CopyTextIcon className="size-14" />
        )}
      </button>
    </Tooltip>
  )
}
