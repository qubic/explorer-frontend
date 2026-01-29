import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CheckIcon, CopyTextIcon } from '@app/assets/icons'
import { clsxTwMerge, copyText } from '@app/utils'
import Tooltip from '../Tooltip'
import { COPY_BUTTON_TYPES, type CopyTextButtonType } from './CopyTextButton.constants'

type Props = {
  text: string
  className?: string
  type?: CopyTextButtonType
}

export default function CopyTextButton({
  text,
  className,
  type = COPY_BUTTON_TYPES.GENERIC
}: Props) {
  const { t } = useTranslation('network-page')
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    copyText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  const getTooltipText = () => {
    switch (type) {
      case COPY_BUTTON_TYPES.ADDRESS:
        return t('copyAddress')
      case COPY_BUTTON_TYPES.TRANSACTION:
        return t('copyTransactionId')
      case COPY_BUTTON_TYPES.GENERIC:
      default:
        return t('copyToClipboard')
    }
  }

  return (
    <Tooltip content={isCopied ? t('copied') : getTooltipText()} tooltipId="copy-text-button">
      <button
        type="button"
        className={clsxTwMerge(
          'flex items-center justify-center rounded-8 text-muted-foreground',
          isCopied ? 'hover:cursor-default' : 'hover:text-foreground',
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
