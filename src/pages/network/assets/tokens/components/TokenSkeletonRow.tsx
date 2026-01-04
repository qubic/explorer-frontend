export default function TokenSkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border">
      <td className="px-8 py-16 sm:p-16">
        <div className="h-16 rounded bg-muted xs:h-20" />
      </td>

      <td className="px-8 py-16 sm:p-16">
        <div className="h-16 w-96 rounded bg-muted xs:h-20 sm:h-40 sm:w-full sm:min-w-[248px] sm:max-w-[532px] 827px:h-20" />
      </td>
    </tr>
  )
}
