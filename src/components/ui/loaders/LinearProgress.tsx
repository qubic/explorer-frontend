export default function LinearProgress() {
  return (
    <div className="w-full">
      <div className="h-1.5 w-full bg-primary-30 overflow-hidden">
        <div className="animate-progress w-full h-full bg-primary-70/30 origin-left-right" />
      </div>
    </div>
  )
}
