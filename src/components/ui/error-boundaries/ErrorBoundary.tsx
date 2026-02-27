/* eslint-disable react/destructuring-assignment */
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { type WithTranslation, withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Routes } from '@app/router'
import { Button } from '../buttons'
import ErrorDisplay from './ErrorDisplay'

interface ErrorBoundaryProps extends WithTranslation {
  children: ReactNode
  pathname?: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showRetry?: boolean
  showGoHome?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: undefined
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.pathname && this.props.pathname !== prevProps.pathname && this.state.hasError) {
      this.setState({ hasError: false, error: undefined })
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Optionally log the error to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    const { t, showRetry = true, showGoHome = true } = this.props

    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="mx-auto grid min-h-[inherit] place-items-center overflow-x-hidden p-20">
          <ErrorDisplay error={this.state.error} />

          <div className="mb-20 mt-60 flex flex-col-reverse items-center gap-20 md:flex-row">
            {showRetry && (
              <Button variant="outlined" onClick={this.handleRetry}>
                {t('retry', { ns: 'error-404-page' })}
              </Button>
            )}

            {showGoHome && (
              <Button variant="filled">
                <Link to={Routes.NETWORK.ROOT} className="text-inherit">
                  {t('backToHomePage', { ns: 'error-404-page' })}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const ErrorBoundaryWithTranslation = withTranslation()(ErrorBoundary)

export default ErrorBoundaryWithTranslation
