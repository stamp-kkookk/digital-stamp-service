import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Toaster } from '@/lib/toast'
import '@/assets/styles/index.css'

// Create a QueryClient instance with comprehensive error handling
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

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Toaster />
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>
)
