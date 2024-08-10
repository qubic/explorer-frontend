import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
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
          ? 'border-[1px] border-gray-70 bg-gray-80'
          : 'my-8 bg-gray-70 transition-all duration-300'
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
      <button
        type="button"
        aria-label="toggle-entries"
        className="mx-auto flex gap-12 rounded-8 p-8 hover:bg-primary-30"
        onClick={handleToggleEntries}
      >
        <span className="text-center font-space text-14">
          {entriesOpen ? t('hide') : t('show')} {entries.length} {t('transactions')}
        </span>
        <ChevronDownIcon
          className={clsxTwMerge(
            'h-20 w-20 text-gray-50 transition-transform duration-300',
            entriesOpen ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>
    </>
  )
}
