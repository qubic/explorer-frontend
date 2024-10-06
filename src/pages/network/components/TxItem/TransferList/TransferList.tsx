import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronToggleButton } from '@app/components/ui/buttons'
import { clsxTwMerge } from '@app/utils'
import type { Transfer } from '@app/utils/qubic-ts'
import type { TxItemVariant } from '../TxItem.types'
import TransferItem from './TransferItem'
import { getTransferItemClassName } from './TransferList.utils'

type Props = {
  entries: Transfer[]
  variant?: TxItemVariant
}

function TransferList({ entries, variant = 'primary' }: Props) {
  const { t } = useTranslation('network-page')

  if (!entries.length) return null

  return (
    <div
      className={clsxTwMerge(
        'flex flex-col gap-8 rounded-12 p-12 md:p-16',
        variant === 'secondary'
          ? 'border-[1px] border-primary-60 bg-primary-70'
          : 'my-8 bg-primary-60 transition-all duration-300'
      )}
    >
      <div className="flex justify-between">
        <p className="font-space text-14 leading-18 text-gray-50">{t('destination')}</p>
        <p className="hidden font-space text-14 leading-18 text-gray-50 md:block">{t('amount')}</p>
      </div>
      <ul>
        {entries.map((item, index) => (
          <TransferItem
            key={`${item.destId}-${item.amount}`}
            className={getTransferItemClassName(index, entries.length, variant)}
            transfer={item}
          />
        ))}
      </ul>
    </div>
  )
}

export default function TransferListToggle({ entries, variant = 'primary' }: Props) {
  const { t } = useTranslation('network-page')
  const [entriesOpen, setEntriesOpen] = useState(false)

  const handleToggleEntries = () => setEntriesOpen((prev) => !prev)

  if (!entries.length) return null

  if (variant === 'secondary') {
    return (
      <>
        <p className="py-12 font-space text-18 leading-20">
          {entries.length} {t('transactions')}
        </p>
        <TransferList entries={entries} variant="secondary" />
      </>
    )
  }

  return (
    <>
      {entriesOpen && <TransferList entries={entries} />}
      <ChevronToggleButton
        className="mx-auto p-8"
        aria-label="toggle-entries"
        isOpen={entriesOpen}
        onClick={handleToggleEntries}
      >
        {entriesOpen ? t('hide') : t('show')} {entries.length} {t('transactions')}
      </ChevronToggleButton>
    </>
  )
}
