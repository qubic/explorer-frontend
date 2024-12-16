import { useGetAddressOwnedAssetsQuery } from '@app/store/apis/archiver-v1.api'
import { formatString } from '@app/utils'
import { isAssetsIssuerAddress } from '@app/utils/qubic-ts'
import { animated, useSpring, useTransition } from '@react-spring/web'
import { AddressLink, CardItem } from '../../components'

type Props = {
  addressId: string
}

export default function OwnedAssets({ addressId }: Props) {
  const { data: ownedAssets } = useGetAddressOwnedAssetsQuery(
    { address: addressId },
    { skip: !addressId }
  )

  // Fade and scale animation for the entire component
  const containerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(100px)' },
    to: {
      opacity: ownedAssets?.length ? 1 : 0,
      transform: ownedAssets?.length ? 'translateX(0px)' : 'translateX(20px)'
    },
    config: { tension: 220, friction: 15, duration: 500 }
  })

  // Staggered animation for list items
  const transitions = useTransition(ownedAssets || [], {
    from: { opacity: 0, transform: 'translateX(20px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    leave: { opacity: 0, transform: 'translateX(-10px)' },
    delay: 800, // Delay the entire animation
    trail: 500, // Delay between items
    config: { duration: 500 }
  })

  if (!ownedAssets || ownedAssets.length === 0) {
    return null
  }

  return (
    <animated.div style={containerAnimation}>
      <CardItem tag="ul" className="mt-16 flex flex-wrap gap-16 p-12">
        {transitions((styles, { data }) => (
          <animated.li
            key={`${data.issuedAsset.name}-${data.issuedAsset.issuerIdentity}`}
            style={styles}
            className="flex items-center gap-4"
          >
            <p className="font-space text-base text-white">{formatString(data.numberOfUnits)}</p>
            {isAssetsIssuerAddress(data.issuedAsset.issuerIdentity) ? (
              <p className="font-space text-base text-gray-50">{data.issuedAsset.name}</p>
            ) : (
              <AddressLink
                label={data.issuedAsset.name}
                value={data.issuedAsset.issuerIdentity}
                className="text-base"
              />
            )}
          </animated.li>
        ))}
      </CardItem>
    </animated.div>
  )
}
