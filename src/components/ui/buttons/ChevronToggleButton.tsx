import { ChevronDownIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'

type Props = {
  isOpen?: boolean
} & React.HTMLAttributes<HTMLButtonElement>

export default function ChevronToggleButton({
  onClick,
  className,
  children,
  isOpen = false,
  ...rest
}: Props) {
  return (
    <button
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      type="button"
      className={clsxTwMerge(
        'flex size-fit items-center gap-12 rounded-8 px-6 py-3 hover:bg-muted',
        className
      )}
      onClick={onClick}
    >
      {children && <span className="text-center font-space text-sm">{children}</span>}
      <ChevronDownIcon
        className={clsxTwMerge(
          'h-20 w-20 text-muted-foreground transition-transform duration-300',
          isOpen ? 'rotate-180' : 'rotate-0'
        )}
      />
    </button>
  )
}
