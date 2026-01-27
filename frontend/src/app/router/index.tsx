import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/landing/LandingPage'
import OwnerStoreListPage from '@/pages/owner/stores/OwnerStoreListPage'
import StoreRegistrationWizardPage from '@/pages/owner/stores/new/StoreRegistrationWizardPage'
import { StampCardListPage } from '@/features/stampcard/pages/StampCardListPage'
import { StampCardFormPage } from '@/features/stampcard/pages/StampCardFormPage'
import CustomerStoreEntryPage from '@/pages/customer/store-entry/CustomerStoreEntryPage'
import CustomerAuthPage from '@/pages/customer/auth/CustomerAuthPage'
import TerminalLoginPage from '@/pages/terminal/TerminalLoginPage'
import StoreSelectPage from '@/pages/terminal/StoreSelectPage'
import IssuanceDashboardPage from '@/pages/terminal/IssuanceDashboardPage'

export const router = createBrowserRouter([
    // Landing
    { path: '/', element: <LandingPage /> },

    // Customer Routes
    { path: '/c/store/:storeId', element: <CustomerStoreEntryPage /> },
    { path: '/c/store/:storeId/auth', element: <CustomerAuthPage /> },

    // Terminal Routes
    { path: '/t/login', element: <TerminalLoginPage /> },
    { path: '/t/stores', element: <StoreSelectPage /> },
    { path: '/t/issuance/:storeId', element: <IssuanceDashboardPage /> },

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
