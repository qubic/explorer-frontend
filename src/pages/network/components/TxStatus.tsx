import { CheckCircleFilledIcon, CheckCircleIcon, XCircleFilledIcon } from '@app/assets/icons'
import { useTranslation } from 'react-i18next'
import type { TxStatusType } from './TxStatus.utils'

type Props = {
  status: TxStatusType
}

const STATUS_CONFIG = {
  success: {
    Icon: CheckCircleFilledIcon,
    colorClass: 'text-success-40',
    labelKey: 'txStatusSuccess'
  },
  failure: {
    Icon: XCircleFilledIcon,
    colorClass: 'text-error-40',
    labelKey: 'txStatusFailed'
  },
  executed: {
    Icon: CheckCircleIcon,
    colorClass: 'text-success-40',
    labelKey: 'txStatusExecuted'
  }
} as const

export default function TxStatus({ status }: Props) {
  const { t } = useTranslation('network-page')
  const { Icon, colorClass, labelKey } = STATUS_CONFIG[status]

  return (
    <div className="flex w-fit items-center gap-4 rounded-full border border-border bg-muted px-8 py-4">
      <p className="font-space text-xs text-muted-foreground">TX</p>
      {isTransferTx && <TxSatusIcon executed={executed} />}
    </div>
  )
}
