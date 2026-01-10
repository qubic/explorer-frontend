import { useTheme } from '@app/contexts/theme'
import { clsxTwMerge } from '@app/utils'
import { Moon, Sun } from 'lucide-react'

type Props = {
  className?: string
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
        <Sun className="text-muted-foreground" size={20} />
      ) : (
        <Moon className="text-muted-foreground" size={20} />
      )}
    </button>
  )
}
