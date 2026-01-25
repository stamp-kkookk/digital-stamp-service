import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import CustomerStoreEntryPage from './pages/customer/store-entry/CustomerStoreEntryPage';
import CustomerAuthPage from './pages/customer/auth/CustomerAuthPage';
import ManageQRPage from './pages/owner/qr-management/ManageQRPage';

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
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
