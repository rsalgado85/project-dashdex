import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '@/routes';

/**
 * QueryClient configuration with aggressive caching strategy.
 * - staleTime: 30 minutes - data is considered fresh for 30 min
 * - gcTime: 24 hours - data stays in cache for 24 hours
 * This reduces API calls significantly while keeping data reasonably fresh.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
