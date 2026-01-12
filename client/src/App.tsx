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
          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route path="/owner/register" element={<OwnerRegisterPage />} />
          <Route path="/owner/stores" element={<OwnerStoresPage />} />
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
