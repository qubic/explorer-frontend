import { Alert } from '@app/components/ui'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

function RichListErrorRow() {
  const { t } = useTranslation('network-page')
  return (
    <tr>
      <td colSpan={3} className="p-32">
        <Alert variant="error">{t('richListLoadFailed')}</Alert>
      </td>
    </tr>
  )
}

const MemoizedRichListErrorRow = memo(RichListErrorRow)

export default MemoizedRichListErrorRow
