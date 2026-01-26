import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CustomerStoreEntryPage from './pages/customer/store-entry/CustomerStoreEntryPage';
import CustomerAuthPage from './pages/customer/auth/CustomerAuthPage';
import ManageQRPage from './pages/owner/qr-management/ManageQRPage';
import TerminalLoginPage from './pages/terminal/TerminalLoginPage';
import StoreSelectPage from './pages/terminal/StoreSelectPage';
import IssuanceDashboardPage from './pages/terminal/IssuanceDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/c/store/:storeId" element={<CustomerStoreEntryPage />} />
          <Route path="/c/store/:storeId/auth" element={<CustomerAuthPage />} />
          <Route path="/owner/qr-management" element={<ManageQRPage />} />
          <Route path="/t/login" element={<TerminalLoginPage />} />
          <Route path="/t/stores" element={<StoreSelectPage />} />
          <Route path="/t/issuance/:storeId" element={<IssuanceDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
