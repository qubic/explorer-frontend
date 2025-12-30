import { Alert } from '@app/components/ui'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function AssetRichListInvalidAssetRow() {
  const { t } = useTranslation('network-page')
  return (
    <tr>
      <td colSpan={4} className="p-32">
        <Alert variant="error">{t('assetsRichListInvalidAssetOrIssuer')}</Alert>
      </td>
    </tr>
  )
}

const MemoizedAssetRichListInvalidAssetRow = memo(AssetRichListInvalidAssetRow)

export default MemoizedAssetRichListInvalidAssetRow
