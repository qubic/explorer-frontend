import { memo } from 'react'

import Alert from './Alert'

type Props = Readonly<{
  colSpan: number
  message: string
}>

const TableErrorRow = memo(function TableErrorRow({ colSpan, message }: Props) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-32">
        <Alert variant="error">{message}</Alert>
      </td>
    </tr>
  )
})

export default TableErrorRow
