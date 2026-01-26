import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import OwnerStoreListPage from './pages/owner/stores/OwnerStoreListPage'
import StoreRegistrationWizardPage from './pages/owner/stores/new/StoreRegistrationWizardPage'
import { StampCardListPage } from './features/stampcard/pages/StampCardListPage'
import { StampCardFormPage } from './features/stampcard/pages/StampCardFormPage'

export const router = createBrowserRouter([
    // Landing
    { path: '/', element: <LandingPage /> },

    // Owner Routes - Stores
    { path: '/o/stores', element: <OwnerStoreListPage /> },
    { path: '/o/stores/new', element: <StoreRegistrationWizardPage /> },

    // Owner Routes - Stamp Cards
    {
        path: '/o/stores/:storeId/stamp-cards',
        element: <StampCardListPage />,
    },
    {
        path: '/o/stores/:storeId/stamp-cards/create',
        element: <StampCardFormPage />,
    },
    {
        path: '/o/stores/:storeId/stamp-cards/:id/edit',
        element: <StampCardFormPage />,
    },

    // Fallback - redirect to home
    { path: '*', element: <Navigate to="/" replace /> },
])
