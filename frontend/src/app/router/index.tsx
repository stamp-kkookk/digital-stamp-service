import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/landing/LandingPage'
import OwnerStoreListPage from '@/pages/owner/stores/OwnerStoreListPage'
import StoreRegistrationWizardPage from '@/pages/owner/stores/new/StoreRegistrationWizardPage'
import { StampCardListPage } from '@/features/stampcard/pages/StampCardListPage'
import { StampCardFormPage } from '@/features/stampcard/pages/StampCardFormPage'
import CustomerStoreEntryPage from '@/pages/customer/store-entry/CustomerStoreEntryPage'
import CustomerAuthPage from '@/pages/customer/auth/CustomerAuthPage'
import OwnerLoginPage from '@/pages/owner/OwnerLoginPage'

export const router = createBrowserRouter([
    // Landing
    { path: '/', element: <LandingPage /> },

    // Customer Routes
    { path: '/customer/store/:storeId', element: <CustomerStoreEntryPage /> },
    { path: '/customer/store/:storeId/auth', element: <CustomerAuthPage /> },

    // Owner Routes - Auth
    { path: '/owner/login', element: <OwnerLoginPage /> },

    // Owner Routes - Stores
    { path: '/owner/stores', element: <OwnerStoreListPage /> },
    { path: '/owner/stores/new', element: <StoreRegistrationWizardPage /> },

    // Owner Routes - Stamp Cards
    {
        path: '/owner/stores/:storeId/stamp-cards',
        element: <StampCardListPage />,
    },
    {
        path: '/owner/stores/:storeId/stamp-cards/create',
        element: <StampCardFormPage />,
    },
    {
        path: '/owner/stores/:storeId/stamp-cards/:id/edit',
        element: <StampCardFormPage />,
    },

    // Fallback - redirect to home
    { path: '*', element: <Navigate to="/" replace /> },
])
