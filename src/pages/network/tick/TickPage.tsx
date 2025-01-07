import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { formatString } from '@app/utils'
import { HomeLink } from '../components'
import { TickDetails, TickTransactions } from './components'

function TickPage() {
  const { t } = useTranslation('network-page')
  const { tick = '0' } = useParams()

  return (
    <PageLayout>
      <Breadcrumbs>
        <HomeLink />
        <p className="font-sans text-xs text-primary-30">
          {t('tick')} {formatString(tick)}
        </p>
      </Breadcrumbs>
      <TickDetails tick={Number(tick)} />
      <TickTransactions tick={Number(tick)} />
    </PageLayout>
  )
}

const TickPageWithHelmet = withHelmet(TickPage, {
  title: 'Tick | Qubic Explorer',
  meta: [{ name: 'description', content: 'Tick details and transactions of Qubic Network' }]
})

export default TickPageWithHelmet
