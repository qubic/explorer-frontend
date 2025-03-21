import { useTranslation } from 'react-i18next'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { useGetNodesInfoQuery } from '@app/store/apis/testnet-qubic-rpc-v1'
import { HomeLink } from '../../components'
import { GeneralInfo, NetworkStatusCard } from './components'

function HackathonPage() {
  const { t } = useTranslation('network-page')

  const { data } = useGetNodesInfoQuery()

  return (
    <PageLayout className="space-y-20">
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="text-xs text-primary-30">{t('hackathon')}</p>
      </Breadcrumbs>
      <div className="space-y-24 md:space-y-64">
        <h1 className="text-primary-100 mx-auto flex w-fit flex-col gap-6 text-center text-4xl font-bold uppercase sm:text-5xl md:text-7xl">
          Madrid
          <br /> <span className="rounded bg-[#D2FDD1] px-14 text-black">Hackathon</span>
        </h1>
        <GeneralInfo />
        <section>
          <h2 className="mb-10 text-center text-2xl sm:mb-20 sm:text-4xl">Testnet info</h2>
          {data && <NetworkStatusCard data={data} />}
        </section>
      </div>
    </PageLayout>
  )
}

const HackathonPageWithHelmet = withHelmet(HackathonPage, {
  title: 'Hackathon | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the info for qubic hackathon Madrid' }]
})

export default HackathonPageWithHelmet
