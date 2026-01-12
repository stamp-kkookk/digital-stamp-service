import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';

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
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/owner/login" element={<OwnerLoginPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
