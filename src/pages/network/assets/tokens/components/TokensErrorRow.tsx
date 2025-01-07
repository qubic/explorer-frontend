import { Alert } from '@app/components/ui'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function TokensErrorRow() {
  const { t } = useTranslation('network-page')
  return (
    <tr>
      <td colSpan={3} className="p-32">
        <Alert variant="error">{t('tokenLoadFailed')}</Alert>
      </td>
    </tr>
  )
}

const MemoizedTokensErrorRow = memo(TokensErrorRow)

export default MemoizedTokensErrorRow
