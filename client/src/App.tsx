import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { setupErrorInterceptor } from './api/client';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { OwnerRegisterPage } from './pages/OwnerRegisterPage';
import { OwnerStoresPage } from './pages/OwnerStoresPage';
import { StoreDetailPage } from './pages/StoreDetailPage';
import { StoreQRPage } from './pages/StoreQRPage';
import { CustomerLandingPage } from './pages/CustomerLandingPage';
import WalletRegisterPage from './pages/WalletRegisterPage';
import WalletAccessPage from './pages/WalletAccessPage';
import WalletHomePage from './pages/WalletHomePage';
import IssuanceRequestPage from './pages/IssuanceRequestPage';
import IssuanceWaitPage from './pages/IssuanceWaitPage';
import OwnerTerminalPage from './pages/OwnerTerminalPage';
import MyRewardsPage from './pages/MyRewardsPage';
import RedemptionPage from './pages/RedemptionPage';
import StampMigrationPage from './pages/StampMigrationPage';
import OwnerMigrationPage from './pages/OwnerMigrationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { showToast } = useToast();

  useEffect(() => {
    setupErrorInterceptor(showToast);
  }, [showToast]);

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Customer Routes */}
          <Route path="/s/:storeId" element={<CustomerLandingPage />} />
          <Route path="/s/:storeId/request" element={<IssuanceRequestPage />} />
          <Route path="/issuance/:requestId/wait" element={<IssuanceWaitPage />} />
          <Route path="/wallet/register" element={<WalletRegisterPage />} />
          <Route path="/wallet/access" element={<WalletAccessPage />} />
          <Route path="/wallet/home" element={<WalletHomePage />} />
          <Route path="/wallet/rewards" element={<MyRewardsPage />} />
          <Route path="/redemption/:rewardId" element={<RedemptionPage />} />
          <Route path="/migration/:storeId" element={<StampMigrationPage />} />

          {/* Owner Routes */}
          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route path="/owner/register" element={<OwnerRegisterPage />} />
          <Route path="/owner/stores" element={<OwnerStoresPage />} />
          <Route path="/owner/stores/:storeId" element={<StoreDetailPage />} />
          <Route path="/owner/stores/:storeId/qr" element={<StoreQRPage />} />
          <Route path="/owner/terminal" element={<OwnerTerminalPage />} />
          <Route path="/owner/migration" element={<OwnerMigrationPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
