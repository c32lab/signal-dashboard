import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  title?: string
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  showTrace: boolean
}

export default class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, showTrace: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[SectionErrorBoundary] ${this.props.title ?? 'Section'}:`, error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showTrace: false })
  }

  toggleTrace = () => {
    this.setState((prev) => ({ showTrace: !prev.showTrace }))
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { title } = this.props
    const { error, showTrace } = this.state

    return (
      <div className="bg-gray-900 border border-red-800/50 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-base">⚠️</span>
          <span className="text-sm font-medium text-red-300">
            Failed to render{title ? ` ${title}` : ''}
          </span>
        </div>
        {error && (
          <p className="text-xs text-gray-500">{error.message}</p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={this.handleReset}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
          {error && (
            <button
              onClick={this.toggleTrace}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              {showTrace ? '▾ Hide trace' : '▸ Show trace'}
            </button>
          )}
        </div>
        {showTrace && error && (
          <pre className="p-3 bg-gray-800 rounded-lg text-xs text-red-400 overflow-auto max-h-40 whitespace-pre-wrap">
            {error.stack}
          </pre>
        )}
      </div>
    )
  }
}
