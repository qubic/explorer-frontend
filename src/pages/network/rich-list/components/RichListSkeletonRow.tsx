export default function RichListSkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-primary-60">
      <td className="px-8 py-16 sm:p-16">
        <div className="mx-auto size-16 rounded bg-gray-70 xs:size-20" />
      </td>

      <td className="px-8 py-16 sm:p-16">
        <div className="h-16 w-96 rounded bg-gray-70 xs:h-20 sm:h-40 sm:w-full sm:min-w-[248px] sm:max-w-[532px] 827px:h-20" />
      </td>

      <td className="px-8 py-16 text-right sm:p-16">
        <div className="ml-auto h-16 w-136 rounded bg-gray-70 xs:h-20" />
      </td>
    </tr>
  )
}
