import { createBrowserRouter } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import OwnerStoreListPage from './pages/owner/stores/OwnerStoreListPage'

export const router = createBrowserRouter([
    { path: '/', element: <LandingPage /> },
    { path: '/o/stores', element: <OwnerStoreListPage /> },
])
