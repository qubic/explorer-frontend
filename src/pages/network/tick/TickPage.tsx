import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs, Tabs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { formatString } from '@app/utils'
import { HomeLink } from '../components'
import { TickDetails, TickEvents, TickTransactions } from './components'

function TickPage() {
  const { t } = useTranslation('network-page')
  const { tick = '0' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedTabIndex = useMemo(() => {
    const tab = searchParams.get('tab')
    if (tab === 'events') return 1
    return 0
  }, [searchParams])

  const handleTabChange = useCallback(
    (index: number) => {
      setSearchParams(index === 1 ? { tab: 'events' } : {}, { replace: true })
    },
    [setSearchParams]
  )

  return (
    <PageLayout>
      <Breadcrumbs>
        <HomeLink />
        <p className="font-sans text-xs text-primary-30">
          {t('tick')} {formatString(tick)}
        </p>
      </Breadcrumbs>
      <TickDetails tick={Number(tick)} />
      <Tabs
        variant="buttons"
        className="mt-48"
        selectedIndex={selectedTabIndex}
        onChange={handleTabChange}
      >
        <Tabs.List>
          <Tabs.Tab>{t('transactions')}</Tabs.Tab>
          <Tabs.Tab>{t('events')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            <TickTransactions tick={Number(tick)} />
          </Tabs.Panel>
          <Tabs.Panel>
            <TickEvents tick={Number(tick)} />
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    </PageLayout>
  )
}

const TickPageWithHelmet = withHelmet(TickPage, {
  title: 'Tick | Qubic Explorer',
  meta: [{ name: 'description', content: 'Tick details and transactions of Qubic Network' }]
})

export default TickPageWithHelmet
