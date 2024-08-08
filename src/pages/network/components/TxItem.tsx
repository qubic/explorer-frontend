import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from '@app/assets/icons'
import type { Transaction } from '@app/services/archiver'
import { clsxTwMerge, formatString } from '@app/utils'
import type { Transfer } from '@app/utils/qubic-ts'
import { getTransfers, QUTIL_ADDRESS } from '@app/utils/qubic-ts'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddressLink from './AddressLink'
import CardItem from './CardItem'
import SubCardItem from './SubCardItem'
import TickLink from './TickLink'
import TxLink from './TxLink'
import TxStatus from './TxStatus'

type Props = {
  tx: Omit<Transaction, 'inputSize' | 'signatureHex'>
  identify?: string
  nonExecutedTxIds: string[]
  variant: string
  isHistoricalTx?: boolean
}

function TypeItemContent({ inputType }: { inputType: number }) {
  return (
    <p className="font-space text-14 leading-18">
      {formatString(inputType)} {inputType === 0 ? 'Standard' : 'SC'}
    </p>
  )
}

function TransferItem({ transfer, className }: { transfer: Transfer; className?: string }) {
  return (
    <li className={clsxTwMerge(`flex flex-col justify-between gap-8 md:flex-row`, className)}>
      <AddressLink value={transfer.destId} />
      <p className="font-space text-sm">{formatString(Number(transfer.amount))} QUBIC</p>
    </li>
  )
}

function TxItem({
  tx: { txId, sourceId, tickNumber, destId, inputType, amount, inputHex },
  identify,
  nonExecutedTxIds,
  variant,
  isHistoricalTx = false
}: Props) {
  const { t } = useTranslation('network-page')
  const [entries, setEntries] = useState<Transfer[]>([])
  const [entriesOpen, setEntriesOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleToggleDetails = () => {
    setDetailsOpen((prev) => !prev)
  }

  const handleToggleEntries = () => {
    setEntriesOpen((prev) => !prev)
  }

  useEffect(() => {
    if (destId === QUTIL_ADDRESS && inputType === 1 && inputHex) {
      ;(async () => {
        try {
          const transfers = await getTransfers(inputHex)
          setEntries(transfers)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error)
        }
      })()
    }
  }, [destId, inputHex, inputType])

  if (variant === 'primary') {
    return (
      <CardItem className="flex flex-col rounded-12 p-12 transition-all duration-300">
        <div className="flex items-center justify-between gap-8">
          <TxStatus executed={!(nonExecutedTxIds || []).includes(txId)} />
          <div className="flex flex-grow flex-col items-start gap-8 sm:flex-row sm:justify-between">
            {identify ? (
              <div className="flex gap-8">
                {identify === sourceId ? (
                  <ArrowDownIcon className="h-12 w-9" />
                ) : (
                  <ArrowUpIcon className="h-12 w-9" />
                )}
                <AddressLink
                  className="text-16"
                  value={identify === sourceId ? destId : sourceId}
                  copy
                  ellipsis
                />
              </div>
            ) : (
              <TxLink
                isHistoricalTx={isHistoricalTx}
                value={txId}
                className="text-primary-40"
                ellipsis
                copy
              />
            )}
            <p className="text-center font-space text-16">
              {formatString(Number(amount))} <span className="text-gray-50">QUBIC</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="open-transaction-details"
            className="rounded-8 px-6 py-3 hover:bg-primary-30"
            onClick={handleToggleDetails}
          >
            <ChevronDownIcon
              className={clsxTwMerge(
                'h-20 w-20 text-gray-50 transition-transform duration-300',
                detailsOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </button>
        </div>
        {detailsOpen && (
          <div className="mt-14 flex flex-col gap-12 border-t-[1px] border-gray-70 pt-12">
            <SubCardItem
              title={`TX ${t('id')}`}
              variant="primary"
              content={
                <TxLink
                  isHistoricalTx={isHistoricalTx}
                  className="text-14 text-primary-40"
                  value={txId}
                  copy
                />
              }
            />
            <SubCardItem
              title={t('source')}
              variant="primary"
              content={<AddressLink value={sourceId} copy />}
            />
            <SubCardItem
              title={t('destination')}
              variant="primary"
              content={<AddressLink value={destId} copy />}
            />
            <SubCardItem
              title={t('tick')}
              variant="primary"
              content={<TickLink className="text-primary-40" value={tickNumber} />}
            />
            <SubCardItem
              title={t('type')}
              variant="primary"
              content={<TypeItemContent inputType={inputType} />}
            />

            {entries.length > 0 && (
              <>
                {entriesOpen && (
                  <div className="my-8 flex flex-col gap-8 rounded-8 bg-gray-70 p-12 transition-all duration-300">
                    <div className="flex justify-between">
                      <p className="font-space text-14 leading-18 text-gray-50">
                        {t('destination')}
                      </p>
                      <p className="hidden font-space text-14 leading-18 text-gray-50 md:block">
                        {t('amount')}
                      </p>
                    </div>
                    <ul>
                      {entries.map((item) => (
                        <TransferItem
                          key={`${item.destId}-${item.amount}`}
                          className="py-8"
                          transfer={item}
                        />
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  type="button"
                  className="mx-auto flex gap-12 rounded-8 p-8 hover:bg-primary-30"
                  onClick={handleToggleEntries}
                >
                  <span className="text-center font-space text-14">
                    {/* // TODO: Put this in translatiosn */}
                    {entriesOpen ? 'Hide' : 'Show'} {entries.length} {t('transactions')}
                  </span>
                  <ChevronDownIcon
                    className={clsxTwMerge(
                      'h-20 w-20 text-gray-50 transition-transform duration-300',
                      entriesOpen ? 'rotate-180' : 'rotate-0'
                    )}
                  />
                </button>
              </>
            )}
          </div>
        )}
      </CardItem>
    )
  }

  return (
    <>
      <div className="mb-24 flex flex-col gap-10 md:flex-row md:items-center md:gap-16">
        <div className="">
          <TxStatus executed={!(nonExecutedTxIds || []).includes(txId)} />
        </div>
        <TxLink isHistoricalTx={isHistoricalTx} className="text-16 text-gray-50" value={txId} />
      </div>
      <SubCardItem
        title={t('amount')}
        content={<p className="font-space text-14 leading-20">{formatString(amount)} QUBIC</p>}
      />
      <SubCardItem title={t('type')} content={<TypeItemContent inputType={inputType} />} />
      <SubCardItem title={t('source')} content={<AddressLink value={sourceId} />} />
      <SubCardItem title={t('destination')} content={<AddressLink value={destId} />} />
      <SubCardItem
        title={t('tick')}
        content={<TickLink className="text-primary-40" value={tickNumber} />}
      />
      {entries.length > 0 && (
        <>
          <p className="py-12 font-space text-18 leading-20">
            {entries.length} {t('transactions')}
          </p>
          <CardItem className="flex flex-col gap-8 p-12 md:p-16">
            <div className="flex justify-between">
              <p className="font-space text-14 leading-18 text-gray-50">{t('destination')}</p>
              <p className="hidden font-space text-14 leading-18 text-gray-50 md:block">
                {t('amount')}
              </p>
            </div>
            <ul>
              {entries.map((item, index) => (
                <TransferItem
                  key={`${item.destId}-${item.amount}`}
                  className={index !== entries.length - 1 ? 'border-b-[1px] py-12' : 'pt-12'}
                  transfer={item}
                />
              ))}
            </ul>
          </CardItem>
        </>
      )}
    </>
  )
}

const MemoTxItem = memo(TxItem)

export default MemoTxItem
