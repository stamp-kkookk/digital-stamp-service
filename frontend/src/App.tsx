import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '@/app/providers';
import { router } from '@/app/router';
import { Toaster } from '@/lib/toast';

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster />
    </QueryProvider>
  );
}

export default App;
