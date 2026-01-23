import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LandingPage from './pages/landing/LandingPage'
import { StampCardListPage } from './features/stampcard/pages/StampCardListPage'
import { StampCardFormPage } from './features/stampcard/pages/StampCardFormPage'
import { Toaster } from './lib/toast'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: unknown) => {
                // Don't retry on 4xx errors (client errors)
                if (error && typeof error === 'object' && 'status' in error) {
                    const status = (error as { status?: number }).status
                    if (status && status >= 400 && status < 500) {
                        return false
                    }
                }
                // Retry up to 2 times for other errors
                return failureCount < 2
            },
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
            retry: false, // Don't retry mutations by default
        },
    },
})

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Toaster />
                <BrowserRouter>
                <Routes>
                    {/* Landing */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Owner Routes */}
                    <Route path="/o">
                        <Route path="stores/:storeId/stamp-cards" element={<StampCardListPage />} />
                        <Route path="stores/:storeId/stamp-cards/create" element={<StampCardFormPage />} />
                        <Route path="stores/:storeId/stamp-cards/:id/edit" element={<StampCardFormPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>

                    {/* Customer Routes */}
                    <Route path="/c">
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>

                    {/* Terminal Routes */}
                    <Route path="/t">
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default App
