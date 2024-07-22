import loaderAnimation from '@app/assets/animations/qubic-loader-animation.json'
import Lottie from 'lottie-react'

type Props = {
  width?: number
  height?: number
  message?: string
}

export default function AppLoader({ width = 200, height = 200, message = '' }: Props) {
  return (
    <div id="app-loader" className="w-screen h-screen grid place-content-center bg-[#111827]">
      <Lottie animationData={loaderAnimation} loop autoplay style={{ width, height }} />
      {message && <p className="text-gray-50 text-center text-16 mt-10">{message}</p>}
    </div>
  )
}
