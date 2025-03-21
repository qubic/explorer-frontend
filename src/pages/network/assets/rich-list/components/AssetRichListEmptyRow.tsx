import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function AssetRichListErrorRow() {
  const { t } = useTranslation('network-page')
  return (
    <tr>
      <td colSpan={4} className="p-32">
        <p className="text-center text-sm text-gray-50">{t('noEntries')}</p>
      </td>
    </tr>
  )
}

const MemoizedAssetRichListErrorRow = memo(AssetRichListErrorRow)

export default MemoizedAssetRichListErrorRow
