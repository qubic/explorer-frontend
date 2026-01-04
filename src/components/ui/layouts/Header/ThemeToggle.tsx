import { useTheme } from '@app/contexts/theme'
import { clsxTwMerge } from '@app/utils'

type Props = {
  className?: string
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={clsxTwMerge('h-20 w-20', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M4.2 19.8 6 18M18 6l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={clsxTwMerge('h-20 w-20', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 13.2A8.1 8.1 0 0 1 10.8 3a7.2 7.2 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ThemeToggle({ className }: Props) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsxTwMerge(
        'rounded-full p-8 transition-colors duration-300 hover:bg-muted focus:outline-none',
        className
      )}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="text-muted-foreground" />
      ) : (
        <MoonIcon className="text-muted-foreground" />
      )}
    </button>
  )
}
