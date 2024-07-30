import { Children, Fragment } from 'react'

type Props = {
  children?: React.ReactNode | React.ReactNode[]
}

export default function Breadcrumbs({ children }: Props) {
  return (
    <nav aria-label="Breadcrumbs" className="flex">
      <ol className="flex items-center">
        {Children.map(children, (child, index) => (
          <Fragment key={`breadcrumb-${String(index)}`}>
            <li className="flex items-center">{child}</li>
            {index < Children.count(children) - 1 && (
              <li aria-label="breadcrums-separator" className="mx-8 text-gray-500">
                /
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
