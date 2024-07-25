const formatString = (string: string | number | undefined | null) => {
  if (string === undefined || string === null) return '0'

  if (typeof string === 'number') {
    return string.toLocaleString('en-US')
  }

  return string
}

const formatDate = (dateString: string) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
    hour12: true
  } as const

  if (dateString) {
    let date
    if (dateString.includes('T')) {
      date = new Date(dateString)
    } else {
      const timestamp = parseInt(dateString, 10) // Include the radix parameter
      date = new Date(timestamp)
    }
    return new Intl.DateTimeFormat('en-US', options).format(date) // Format date
  }
  return ''
}

function formatEllipsis(str: string) {
  if (str) {
    if (str.length > 10) {
      return `${str.substr(0, 5)}...${str.substr(-5)}`
    }
    return str
  }
  return ''
}

function formatBase64(hex: string) {
  if (hex) {
    const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    const uint8Array = new Uint8Array(bytes)
    const byteArray = Array.from(uint8Array)
    const byteString = String.fromCharCode.apply(null, byteArray)
    const base64String = btoa(byteString)
    return base64String
  }
  return ''
}

function copyText(textToCopy: string) {
  const input = document.createElement('input')
  input.value = textToCopy
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

export * from './styles'
export { copyText, formatBase64, formatDate, formatEllipsis, formatString }
