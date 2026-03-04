import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  showDetails: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, showDetails: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false })
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-lg w-full text-center space-y-4">
          <div className="text-4xl">💥</div>
          <h1 className="text-xl font-bold text-gray-100">Something went wrong</h1>
          <p className="text-sm text-gray-400">
            An unexpected error occurred while rendering this page.
          </p>

          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry
          </button>

          {this.state.error && (
            <div className="pt-2">
              <button
                onClick={this.toggleDetails}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {this.state.showDetails ? '▾ Hide details' : '▸ Show details'}
              </button>
              {this.state.showDetails && (
                <pre className="mt-2 p-3 bg-gray-800 rounded-lg text-left text-xs text-red-400 overflow-auto max-h-48">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}
