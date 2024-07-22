import { Link } from 'react-router-dom'

function HomeLink() {
  return (
    <Link className="text-16 leading-20 mb-8 text-gray-50" to="/network" role="button">
      <img src="assets/icons/home.svg" alt="home" />
    </Link>
  )
}

export default HomeLink
