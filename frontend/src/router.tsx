import { createBrowserRouter } from 'react-router-dom'
import LandingPage from './pages/landing/LandingPage'
import OwnerStoreListPage from './pages/owner/stores/OwnerStoreListPage'
import StoreRegistrationWizardPage from './pages/owner/stores/new/StoreRegistrationWizardPage'

export const router = createBrowserRouter([
    { path: '/', element: <LandingPage /> },
    { path: '/o/stores', element: <OwnerStoreListPage /> },
    { path: '/o/stores/new', element: <StoreRegistrationWizardPage /> },
])
