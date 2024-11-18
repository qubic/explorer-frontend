/* eslint-disable react/jsx-props-no-spreading */
import type { ComponentType } from 'react'
import type { HelmetProps } from 'react-helmet-async'
import { Helmet } from 'react-helmet-async'

function withHelmet<P extends object>(Component: ComponentType<P>, helmetProps: HelmetProps) {
  return function WrappedComponentWithHelmet(props: P) {
    return (
      <>
        <Helmet {...helmetProps} />
        <Component {...props} />
      </>
    )
  }
}

export default withHelmet
