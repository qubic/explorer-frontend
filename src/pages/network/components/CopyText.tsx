import { useEffect, useState } from 'react'

import { CheckIcon, CopyTextIcon } from '@app/assets/icons'
import { copyText } from '@app/utils'

type Props = {
  text: string
}

export default function CopyText({ text }: Props) {
  const [isCopy, setIsCopy] = useState(false)

  useEffect(() => {
    if (isCopy) {
      setTimeout(() => setIsCopy(false), 1000)
    }
  }, [isCopy])

  const handleCopy = () => {
    copyText(text)
    setIsCopy(true)
  }

  return (
    <button type="button" className="h-14 w-14 flex-none" onClick={handleCopy}>
      {isCopy ? (
        <CheckIcon className="w-full text-success-40" />
      ) : (
        <CopyTextIcon className="w-full" />
      )}
    </button>
  )
}
