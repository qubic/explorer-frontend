import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { formatString } from '@app/utils'
import { HomeLink } from '../components'
import { TickDetails, TickTransactions } from './components'

function TickPage() {
  const { t } = useTranslation('network-page')
  const { tick = '0' } = useParams()

  return (
    <div className="mx-auto max-w-[960px] px-12 py-32">
      <Breadcrumbs>
        <HomeLink />
        <p className="font-sans text-12 text-primary-30">
          {t('tick')} {formatString(tick)}
        </p>
      </Breadcrumbs>
      <TickDetails tick={Number(tick)} />
      <TickTransactions tick={Number(tick)} />
    </div>
  )
}

const TickPageWithHelmet = withHelmet(TickPage, {
  title: 'Tick | Qubic Explorer',
  meta: [{ name: 'description', content: 'Tick details and transactions of Qubic Network' }]
})

export default TickPageWithHelmet
