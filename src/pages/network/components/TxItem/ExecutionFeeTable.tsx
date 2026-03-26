import { useTranslation } from 'react-i18next'

import { formatString } from '@app/utils'

type Entry = Readonly<{
  contractIndex: number
  executionFee: string
}>

type Props = Readonly<{
  phaseNumber: number
  entries: Entry[]
  dataLock?: string
}>

export default function ExecutionFeeTable({ phaseNumber, entries, dataLock }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <div className="min-w-0 flex-1 space-y-12">
      <dl className="divide-y divide-gray-60">
        <div className="grid grid-cols-1 gap-4 py-8 first:pt-0 sm:grid-cols-[minmax(140px,180px)_1fr] sm:gap-10">
          <dt className="font-space text-xs leading-5 text-gray-50">{t('phaseNumber')}</dt>
          <dd className="font-space text-sm text-white">{formatString(phaseNumber)}</dd>
        </div>
        <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-[minmax(140px,180px)_1fr] sm:gap-10">
          <dt className="font-space text-xs leading-5 text-gray-50">{t('contractsReported')}</dt>
          <dd className="font-space text-sm text-white">{entries.length}</dd>
        </div>
        {dataLock && (
          <div className="grid grid-cols-1 gap-4 py-8 last:pb-0 sm:grid-cols-[minmax(140px,180px)_1fr] sm:gap-10">
            <dt className="font-space text-xs leading-5 text-gray-50">{t('dataLock')}</dt>
            <dd className="break-all font-space text-sm text-white">{dataLock}</dd>
          </div>
        )}
      </dl>

      <div className="overflow-hidden rounded-8 border border-gray-60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-60 bg-primary-70">
              <th className="px-12 py-8 text-left font-space text-xs text-gray-50">
                {t('contractIndex')}
              </th>
              <th className="px-12 py-8 text-right font-space text-xs text-gray-50">
                {t('executionFee')}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.contractIndex} className="border-b border-gray-60 last:border-b-0">
                <td className="px-12 py-8 font-space text-sm text-white">{entry.contractIndex}</td>
                <td className="px-12 py-8 text-right font-space text-sm text-white">
                  {formatString(entry.executionFee)} QUBIC
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
