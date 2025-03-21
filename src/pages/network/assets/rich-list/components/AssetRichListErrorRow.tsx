import { Alert } from '@app/components/ui'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function AssetRichListErrorRow() {
  const { t } = useTranslation('network-page')
  return (
    <tr>
      <td colSpan={4} className="p-32">
        <Alert variant="error">{t('richListLoadFailed')}</Alert>
      </td>
    </tr>
  )
}

const MemoizedAssetRichListErrorRow = memo(AssetRichListErrorRow)

export default MemoizedAssetRichListErrorRow
