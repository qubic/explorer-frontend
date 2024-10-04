import { HomeIcon } from '@app/assets/icons'
import { Routes } from '@app/router'
import { Link } from 'react-router-dom'

export default function HomeLink() {
  return (
    <Link to={Routes.NETWORK.ROOT} role="button">
      <HomeIcon />
    </Link>
  )
}
