import { LinearProgress } from '@app/components/ui/loaders'

export default function ChartContainer({
  children,
  isLoading
}: {
  children: React.ReactNode
  isLoading: boolean
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-12">
      {isLoading && (
        <div className="absolute inset-0">
          <LinearProgress />
        </div>
      )}
      {children}
    </div>
  )
}
