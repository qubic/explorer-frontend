import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'

import { ArrowTopRightOnSquareIcon } from '@app/assets/icons'
import { withHelmet } from '@app/components/hocs'
import { Badge, Breadcrumbs, Tabs } from '@app/components/ui'
import { ChevronToggleButton, CopyTextButton } from '@app/components/ui/buttons'
import { ErrorFallback } from '@app/components/ui/error-boundaries'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetAddressBalancesQuery, useGetLatestStatsQuery } from '@app/store/apis/archiver-v1'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { clsxTwMerge, formatEllipsis, formatString, isValidQubicAddress } from '@app/utils'
import { useGetAddressName } from '@app/hooks'
import { HomeLink } from '../components'
import { AddressDetails, ContractOverview, OwnedAssets, TransactionsOverview } from './components'

function AddressPage() {
  const { t } = useTranslation('network-page')
  const { addressId = '' } = useParams()
  const location = useLocation()
  const latestStats = useGetLatestStatsQuery()
  const [isValidatingAddress, setIsValidatingAddress] = useState(true)
  const [isAddressValid, setIsAddressValid] = useState(false)
  const addressBalances = useGetAddressBalancesQuery(
    { address: addressId },
    { skip: !addressId || !isAddressValid }
  )
  const { data: smartContracts } = useGetSmartContractsQuery()

  const [detailsOpen, setDetailsOpen] = useState(false)

  // Validate address on mount or when addressId changes
  useEffect(() => {
    const validateAddress = async () => {
      if (!addressId) {
        setIsValidatingAddress(false)
        setIsAddressValid(false)
        return
      }

      // Skip validation if coming from internal link and address has valid format
      const skipValidation = location.state?.skipValidation === true
      const hasValidFormat = addressId.length === 60 && /^[A-Z]+$/.test(addressId)
      if (skipValidation && hasValidFormat) {
        setIsAddressValid(true)
        setIsValidatingAddress(false)
        return
      }

      setIsValidatingAddress(true)
      const isValid = await isValidQubicAddress(addressId)
      setIsAddressValid(isValid)
      setIsValidatingAddress(false)
    }

    validateAddress()
  }, [addressId, location.state])

  const handleToggleDetails = useCallback(() => {
    setDetailsOpen((prev) => !prev)
  }, [])

  const formattedBalanceUsd = useMemo(() => {
    if (!addressBalances.data || !latestStats.data) return ''
    return formatString(+addressBalances.data.balance * (latestStats.data.price ?? 0))
  }, [addressBalances.data, latestStats.data])

  const addressName = useGetAddressName(addressId)

  // Get full smart contract details from API if it's a smart contract
  const smartContractDetails = useMemo(() => {
    if (!smartContracts) return null
    return smartContracts.find((contract) => contract.address === addressId)
  }, [smartContracts, addressId])

  const isSmartContract = !!smartContractDetails

  // Show loading while validating address
  if (isValidatingAddress) {
    return <LinearProgress />
  }

  // Show error if address is invalid
  if (!isAddressValid) {
    return <ErrorFallback message={t('invalidAddressError')} showRetry={false} hideErrorHeader />
  }

  // Show loading while fetching address data
  if (addressBalances.isFetching) {
    return <LinearProgress />
  }

  // Show error if address data not found
  if (!addressBalances.data) {
    return <ErrorFallback message={t('addressNotFoundError')} hideErrorHeader />
  }

  return (
    <PageLayout>
      <Breadcrumbs aria-label="breadcrumbs">
        <HomeLink />
        <p className="font-space text-xs text-primary-30">
          {t('id')} {formatEllipsis(addressId)}
        </p>
      </Breadcrumbs>

      <div className="flex items-center gap-12 pb-6 pt-16">
        <p className="break-all font-space text-base text-gray-50">{addressId}</p>
        <CopyTextButton text={addressId} />
      </div>

      {(addressName || smartContractDetails) && (
        <div className="flex items-center gap-4 pb-16">
          {/* Smart Contract Type Label */}
          {smartContractDetails && (
            <Badge color="primary" size="xs" variant="outlined">
              {t('smartContract')}
            </Badge>
          )}
          {/* Smart Contract Name */}
          {smartContractDetails && (
            <Badge
              color="primary"
              size="xs"
              variant="outlined"
              className={clsxTwMerge({
                'hover:bg-primary-60': smartContractDetails?.website
              })}
            >
              {smartContractDetails?.website ? (
                <a
                  href={smartContractDetails.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  {smartContractDetails.name}
                  <ArrowTopRightOnSquareIcon className="mb-1.5 ml-4 size-12 text-primary-20" />
                </a>
              ) : (
                smartContractDetails?.name
              )}
            </Badge>
          )}
          {/* Token/Exchange Type Label (not for named addresses) */}
          {addressName && 'i18nKey' in addressName && addressName.i18nKey !== 'named-address' && (
            <Badge color="primary" size="xs" variant="outlined">
              {t(addressName.i18nKey)}
            </Badge>
          )}
          {/* Token/Exchange/Named Address Name */}
          {addressName && (
            <Badge
              color="primary"
              size="xs"
              variant="outlined"
              className={clsxTwMerge({
                'hover:bg-primary-60': addressName.website
              })}
            >
              {addressName.website ? (
                <a
                  href={addressName.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  {addressName.name}
                  <ArrowTopRightOnSquareIcon className="mb-1.5 ml-4 size-12 text-primary-20" />
                </a>
              ) : (
                addressName.name
              )}
            </Badge>
          )}
        </div>
      )}

      <div>
        <div className="flex flex-col">
          <div className="flex items-center gap-10">
            <p className="w-fit break-all font-space text-2xl sm:text-36">
              {formatString(addressBalances.data.balance)}{' '}
              <span className="text-gray-50">QUBIC</span>
            </p>
            <ChevronToggleButton
              aria-label="toggle-address-details"
              isOpen={detailsOpen}
              onClick={handleToggleDetails}
            />
          </div>
          <p className="mb-12 mt-8 font-space text-base text-gray-50">${formattedBalanceUsd}</p>
        </div>

        <AddressDetails
          address={addressBalances.data}
          price={latestStats.data?.price ?? 0}
          isVisible={detailsOpen}
        />

        <OwnedAssets addressId={addressId} />
      </div>

      <Tabs variant="buttons" className="mt-40">
        <Tabs.List>
          <Tabs.Tab>{t('transactions')}</Tabs.Tab>
          {isSmartContract && <Tabs.Tab>{t('contract')}</Tabs.Tab>}
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            <TransactionsOverview address={addressBalances.data} addressId={addressId} />
          </Tabs.Panel>
          {isSmartContract && smartContractDetails && (
            <Tabs.Panel>
              <ContractOverview
                asset={smartContractDetails.name}
                githubUrl={smartContractDetails.githubUrl}
                proposalUrl={smartContractDetails.proposalUrl}
                contractIndex={smartContractDetails.contractIndex}
              />
            </Tabs.Panel>
          )}
        </Tabs.Panels>
      </Tabs>
    </PageLayout>
  )
}

const AddressPageWithHelmet = withHelmet(AddressPage, {
  title: 'Address | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the details of an address in Qubic Network' }]
})

export default AddressPageWithHelmet
