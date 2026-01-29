import loaderAnimation from '@app/assets/animations/qubic-loader-animation.json'
import Lottie from 'lottie-react'

type Props = {
  width?: number
  height?: number
  message?: string
}

export default function AppLoader({ width = 200, height = 200, message = '' }: Props) {
  return (
    <div id="app-loader" className="grid h-screen w-screen place-content-center bg-background">
      <Lottie animationData={loaderAnimation} loop autoplay style={{ width, height }} />
      {message && <p className="mt-10 text-center text-16 text-muted-foreground">{message}</p>}
    </div>
  )
}
