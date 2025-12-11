/**
 * Copies text to clipboard using modern or fallback API
 * @param textToCopy - The text to copy to clipboard
 */
function copyText(textToCopy: string) {
  if (navigator.clipboard && window.isSecureContext) {
    // Use the modern clipboard API if available and secure
    navigator.clipboard.writeText(textToCopy)
  } else {
    const input = document.createElement('input')
    input.value = textToCopy
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
}

export * from './date'
export * from './qubic-ts'
export * from './format'
export * from './styles'
export { copyText }
