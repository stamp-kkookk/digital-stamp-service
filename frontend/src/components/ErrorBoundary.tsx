import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null })
        window.location.reload()
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 bg-kkookk-paper">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md">
                        <div
                            className="flex items-center justify-center w-16 h-16 rounded-full"
                            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                        >
                            <AlertCircle size={32} className="text-kkookk-red" />
                        </div>

                        <div>
                            <h1 className="mb-2 text-2xl font-semibold text-kkookk-navy">
                                앗, 오류가 발생했습니다
                            </h1>
                            <p className="text-kkookk-steel">
                                예상치 못한 문제가 발생했습니다. 페이지를 새로고침하여 다시 시도해주세요.
                            </p>
                        </div>

                        {this.state.error && (
                            <details className="w-full p-4 rounded-2xl bg-kkookk-sand">
                                <summary className="text-sm font-medium cursor-pointer text-kkookk-steel">
                                    에러 상세 정보
                                </summary>
                                <pre className="mt-2 text-xs overflow-auto text-kkookk-red">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="flex items-center gap-2 h-14 px-6 rounded-2xl bg-kkookk-orange-500 text-white font-semibold active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-kkookk-orange-500/30"
                        >
                            <RefreshCcw size={20} />
                            페이지 새로고침
                        </button>

                        <a
                            href="/"
                            className="text-sm text-kkookk-steel hover:text-kkookk-navy transition-colors underline"
                        >
                            홈으로 돌아가기
                        </a>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
