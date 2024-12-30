import { Alert } from '@app/components/ui'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function SmartContractsErrorRow() {
  const { t } = useTranslation('network-page')
  return (
    <tr>
      <td colSpan={3} className="p-32">
        <Alert variant="error">{t('smartContractsLoadFailed')}</Alert>
      </td>
    </tr>
  )
}

const MemoizedSmartContractsErrorRow = memo(SmartContractsErrorRow)

export default MemoizedSmartContractsErrorRow
