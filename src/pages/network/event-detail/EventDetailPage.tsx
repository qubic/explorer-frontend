import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Badge, Breadcrumbs } from '@app/components/ui'
import { CopyTextButton } from '@app/components/ui/buttons'
import { ErrorFallback } from '@app/components/ui/error-boundaries'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetAddressName, useGetSmartContractByIndex } from '@app/hooks'
import {
  useGetEventsQuery,
  getEventTypeLabel,
  getLastProcessedTickFromEventsError,
  ORACLE_QUERY_STATUS_LABELS,
  ORACLE_QUERY_TYPE_LABELS
} from '@app/store/apis/events'
import { formatDate, formatString } from '@app/utils'
import { AddressLink, HomeLink, SubCardItem, TickLink, TxLink, VirtualTxLink } from '../components'

function EventDetailPage() {
  const { t } = useTranslation('network-page')
  const { tickNumber: tickParam = '', logId: logIdParam = '' } = useParams()

  const tickNumber = Number(tickParam)
  const logId = Number(logIdParam)
  const isValidParams =
    Number.isFinite(tickNumber) && tickNumber > 0 && Number.isFinite(logId) && logId >= 0

  const { data, isFetching, isError, error } = useGetEventsQuery(
    { tickNumber, logId, size: 1 },
    { skip: !isValidParams }
  )

  const event = data?.events?.[0]

  const sourceAddressName = useGetAddressName(event?.source ?? '')
  const destinationAddressName = useGetAddressName(event?.destination ?? '')
  const issuerAddressName = useGetAddressName(event?.assetIssuer ?? '')

  const ownerAddressName = useGetAddressName(event?.owner ?? '')
  const possessorAddressName = useGetAddressName(event?.possessor ?? '')
  const queryingEntityName = useGetAddressName(event?.queryingEntity ?? '')

  const contract = useGetSmartContractByIndex(
    event?.contractIndex && event.contractIndex > 0 ? event.contractIndex : undefined
  )
  const managingContract = useGetSmartContractByIndex(event?.managingContractIndex)
  const sourceContract = useGetSmartContractByIndex(event?.sourceContractIndex)
  const destinationContract = useGetSmartContractByIndex(event?.destinationContractIndex)

  const { date, time } = useMemo(
    () =>
      formatDate(event?.timestamp !== undefined ? String(event.timestamp) : undefined, {
        split: true
      }),
    [event?.timestamp]
  )

  const lastProcessedTick = isError ? getLastProcessedTickFromEventsError(error) : null

  if (isFetching) return <LinearProgress />
  if (isError) {
    return (
      <ErrorFallback
        message={
          lastProcessedTick !== null
            ? t('tickNotYetProcessedEvents', {
                lastProcessedTick: lastProcessedTick.toLocaleString()
              })
            : t('eventsLoadFailed')
        }
        hideErrorHeader
      />
    )
  }
  if (!event) return <ErrorFallback message={t('eventNotFound')} hideErrorHeader />

  return (
    <PageLayout>
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="font-space text-xs text-gray-50">
          {t('tick')} <TickLink className="text-xs text-gray-50" value={event.tickNumber} />
        </p>
        <p className="font-space text-xs text-primary-30">
          {t('event')} {event.logId}
        </p>
      </Breadcrumbs>

      <p className="my-16 font-space text-base font-500">{t('eventDetails')}</p>

      <div>
        <SubCardItem
          variant="secondary"
          title={t('id')}
          content={<p className="font-space text-sm">{event.logId}</p>}
          hideTopBorder
        />
        <SubCardItem
          variant="secondary"
          title={t('epoch')}
          content={<p className="font-space text-sm">{event.epoch}</p>}
        />
        <SubCardItem
          variant="secondary"
          title={t('tick')}
          content={<TickLink className="text-sm text-primary-30" value={event.tickNumber} />}
        />
        <SubCardItem
          variant="secondary"
          title={t('timestamp')}
          content={
            <p className="font-space text-sm">
              <span className="text-white">{date}</span>{' '}
              <span className="text-gray-50">{time}</span>
            </p>
          }
        />
        <SubCardItem
          variant="secondary"
          title={t('eventType')}
          content={
            <Badge color="primary" size="xs" className="text-gray-50">
              {getEventTypeLabel(event.type)}
            </Badge>
          }
        />
        <SubCardItem
          variant="secondary"
          title={t('txID')}
          content={
            event.isVirtualTx ? (
              <VirtualTxLink value={event.transactionHash} />
            ) : (
              <TxLink value={event.transactionHash} className="text-primary-30" copy />
            )
          }
        />
        {event.contractIndex > 0 && (
          <SubCardItem
            variant="secondary"
            title={t('eventContractIndex')}
            content={
              <p className="font-space text-sm">
                {event.contractIndex}
                {contract && <span className="text-gray-50"> ({contract.name})</span>}
              </p>
            }
          />
        )}
        {event.contractMessageType !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('contractMessageType')}
            content={<p className="font-space text-sm">{event.contractMessageType}</p>}
          />
        )}
        <SubCardItem
          variant="secondary"
          title={t('logDigest')}
          content={
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <p className="break-all font-space text-sm text-gray-50">{event.logDigest}</p>
              <CopyTextButton text={event.logDigest} />
            </div>
          }
        />

        {event.source && (
          <SubCardItem
            variant="secondary"
            title={t('source')}
            content={
              <AddressLink
                value={event.source}
                label={sourceAddressName?.name}
                copy
                showTooltip={!!sourceAddressName?.name}
              />
            }
          />
        )}
        {event.destination && (
          <SubCardItem
            variant="secondary"
            title={t('destination')}
            content={
              <AddressLink
                value={event.destination}
                label={destinationAddressName?.name}
                copy
                showTooltip={!!destinationAddressName?.name}
              />
            }
          />
        )}
        {event.amount !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('amount')}
            content={
              <p className="font-space text-sm">
                <span className="font-500">{formatString(event.amount)}</span>{' '}
                <span className="text-gray-50">{event.assetName ?? 'QUBIC'}</span>
              </p>
            }
          />
        )}

        {event.assetIssuer && (
          <SubCardItem
            variant="secondary"
            title={t('assetIssuer')}
            content={
              <AddressLink
                value={event.assetIssuer}
                label={issuerAddressName?.name}
                copy
                showTooltip={!!issuerAddressName?.name}
              />
            }
          />
        )}
        {event.managingContractIndex !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('managingContractIndex')}
            content={
              <p className="font-space text-sm">
                {event.managingContractIndex}
                {managingContract && (
                  <span className="text-gray-50"> ({managingContract.name})</span>
                )}
              </p>
            }
          />
        )}
        {event.owner && (
          <SubCardItem
            variant="secondary"
            title={t('owner')}
            content={
              <AddressLink
                value={event.owner}
                label={ownerAddressName?.name}
                copy
                showTooltip={!!ownerAddressName?.name}
              />
            }
          />
        )}
        {event.possessor && (
          <SubCardItem
            variant="secondary"
            title={t('possessor')}
            content={
              <AddressLink
                value={event.possessor}
                label={possessorAddressName?.name}
                copy
                showTooltip={!!possessorAddressName?.name}
              />
            }
          />
        )}
        {event.sourceContractIndex !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('sourceContractIndex')}
            content={
              <p className="font-space text-sm">
                {event.sourceContractIndex}
                {sourceContract && <span className="text-gray-50"> ({sourceContract.name})</span>}
              </p>
            }
          />
        )}
        {event.destinationContractIndex !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('destinationContractIndex')}
            content={
              <p className="font-space text-sm">
                {event.destinationContractIndex}
                {destinationContract && (
                  <span className="text-gray-50"> ({destinationContract.name})</span>
                )}
              </p>
            }
          />
        )}
        {event.unitOfMeasurement && (
          <SubCardItem
            variant="secondary"
            title={t('unitOfMeasurement')}
            content={<p className="font-space text-sm">{event.unitOfMeasurement}</p>}
          />
        )}
        {event.numberOfDecimalPlaces !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('numberOfDecimalPlaces')}
            content={<p className="font-space text-sm">{event.numberOfDecimalPlaces}</p>}
          />
        )}
        {event.value && (
          <SubCardItem
            variant="secondary"
            title={t('value')}
            content={<p className="break-all font-space text-sm">{event.value}</p>}
          />
        )}
        {event.deductedAmount !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('deductedAmount')}
            content={
              <p className="font-space text-sm">{formatString(event.deductedAmount)} QUBIC</p>
            }
          />
        )}
        {event.remainingAmount !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('remainingAmount')}
            content={
              <p className="font-space text-sm">{formatString(event.remainingAmount)} QUBIC</p>
            }
          />
        )}
        {event.queryingEntity && (
          <SubCardItem
            variant="secondary"
            title={t('queryingEntity')}
            content={
              <AddressLink
                value={event.queryingEntity}
                label={queryingEntityName?.name}
                copy
                showTooltip={!!queryingEntityName?.name}
              />
            }
          />
        )}
        {event.queryId !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('queryId')}
            content={
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <p className="break-all font-space text-sm">{event.queryId}</p>
                <CopyTextButton text={event.queryId} />
              </div>
            }
          />
        )}
        {event.queryType !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('queryType')}
            content={
              <p className="font-space text-sm">
                {event.queryType}
                <span className="text-gray-50">
                  {' '}
                  ({ORACLE_QUERY_TYPE_LABELS[event.queryType] ?? 'UNKNOWN'})
                </span>
              </p>
            }
          />
        )}
        {event.queryStatus !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('queryStatus')}
            content={
              <p className="font-space text-sm">
                {event.queryStatus}
                <span className="text-gray-50">
                  {' '}
                  ({ORACLE_QUERY_STATUS_LABELS[event.queryStatus] ?? 'UNKNOWN'})
                </span>
              </p>
            }
          />
        )}
        {event.interfaceIndex !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('interfaceIndex')}
            content={<p className="font-space text-sm">{event.interfaceIndex}</p>}
          />
        )}
        {event.subscriptionId !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('subscriptionId')}
            content={<p className="break-all font-space text-sm">{event.subscriptionId}</p>}
          />
        )}
        {event.periodMillis !== undefined && (
          <SubCardItem
            variant="secondary"
            title={t('periodMillis')}
            content={<p className="font-space text-sm">{formatString(event.periodMillis)}</p>}
          />
        )}
        {event.firstQueryTimestamp && (
          <SubCardItem
            variant="secondary"
            title={t('firstQueryTimestamp')}
            content={
              <p className="font-space text-sm">
                {formatDate(event.firstQueryTimestamp) || event.firstQueryTimestamp}
              </p>
            }
          />
        )}
        {event.rawPayload && (
          <SubCardItem
            variant="secondary"
            title={t('rawPayload')}
            content={
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <p className="break-all font-space text-sm text-gray-50">{event.rawPayload}</p>
                <CopyTextButton text={event.rawPayload} />
              </div>
            }
          />
        )}
      </div>
    </PageLayout>
  )
}

const EventDetailPageWithHelmet = withHelmet(EventDetailPage, {
  title: 'Event | Qubic Explorer'
})

export default EventDetailPageWithHelmet
