export default function LinearProgress() {
  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden bg-primary-30">
        <div className="h-full w-full origin-left-right animate-progress bg-primary-70/30" />
      </div>
    </div>
  )
}
