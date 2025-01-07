import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert } from '@app/components/ui'

function ExchangesErrorRow() {
  const { t } = useTranslation('network-page')
  return (
    <tr>
      <td colSpan={3} className="p-32">
        <Alert variant="error">{t('exchangesLoadFailed')}</Alert>
      </td>
    </tr>
  )
}

const MemoizedExchangesErrorRow = memo(ExchangesErrorRow)

export default MemoizedExchangesErrorRow
