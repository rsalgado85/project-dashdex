import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export function ErrorPage() {
  const error = useRouteError();
  let errorMessage = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || `Error ${error.status}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-dark-bg">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-danger/10">
            <AlertTriangle size={32} className="text-danger" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Something went wrong</h2>
        <p className="text-sm text-text-secondary">{errorMessage}</p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <RefreshCw size={16} />
            Reload page
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-hover text-text-primary text-sm font-medium hover:bg-dark-border transition-colors"
          >
            <Home size={16} />
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
