import { useTranslation } from 'react-i18next'

import { Typography } from '@app/components/ui'
import { formatString } from '@app/utils'
import CardItem from './CardItem'

type Props = {
  dataStatus: boolean
  tickStatus: boolean
  transactions: number
  option: string
}

function TickStatus({ dataStatus, tickStatus, transactions, option }: Props) {
  const { t } = useTranslation('networkPage')

  return (
    <CardItem className="px-24 py-16">
      <div className="flex flex-col md:flex-row justify-between gap-24 md:gap-52">
        <div className="flex gap-52">
          <div className="flex flex-col gap-8">
            <Typography className="text-14 leading-20 font-space text-gray-50">
              {t('dataStatus')}
            </Typography>
            {dataStatus ? (
              <Typography className="text-16 leading-20 font-space text-success-40">
                {t('complete')}
              </Typography>
            ) : (
              <Typography className="text-16 leading-20 font-space text-error-40">
                {t('incomplete')}
              </Typography>
            )}
          </div>
          {dataStatus && (
            <div className="flex flex-col gap-8">
              <Typography className="text-14 leading-20 font-space text-gray-50">
                {t('tickStatus')}
              </Typography>
              {tickStatus ? (
                <Typography className="text-16 leading-20 font-space text-success-40">
                  {t('nonEmpty')} / {t('executed')}
                </Typography>
              ) : (
                <Typography className="text-16 leading-20 font-space text-error-40">
                  {t('empty')} / {t('unexecuted')}
                </Typography>
              )}
            </div>
          )}
        </div>
        {dataStatus && (
          <div className="flex flex-col gap-8">
            <Typography className="text-14 leading-20 font-space text-gray-50">
              {t('numberOfTransactions')}
            </Typography>
            <Typography className="text-16 leading-20 font-space text-primary-20">
              {formatString(transactions)}
            </Typography>
          </div>
        )}
      </div>
    </CardItem>
  )
}

export default TickStatus
