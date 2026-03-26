import { useTranslation } from 'react-i18next'

type Item = Readonly<{
  queryId: string
  replyDigest: string
  knowledgeProof: string
}>

type Props = Readonly<{
  items: Item[]
}>

export default function OracleReplyCommitTable({ items }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <div className="min-w-0 flex-1 space-y-8">
      <p className="font-space text-xs text-gray-50">
        {items.length} {items.length === 1 ? t('commitItem') : t('commitItems')}
      </p>
      {items.map((item, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="rounded-8 border border-primary-60 p-12"
        >
          <dl className="divide-y divide-gray-60">
            {[
              { label: t('queryId'), value: item.queryId },
              { label: t('replyDigest'), value: item.replyDigest },
              { label: t('knowledgeProof'), value: item.knowledgeProof }
            ].map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 gap-4 py-8 first:pt-0 last:pb-0 sm:grid-cols-[minmax(140px,180px)_1fr] sm:gap-10"
              >
                <dt className="font-space text-xs leading-5 text-gray-50">{row.label}</dt>
                <dd className="break-all font-space text-sm text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
