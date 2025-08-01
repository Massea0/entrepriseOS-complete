import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/contexts/theme-context';
import { SupabaseAuthProvider } from '@/providers/supabase-auth-provider';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/providers/supabase-auth-provider';
import { Toaster } from 'sonner';
import { AppStatus } from '@/components/AppStatus';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Pages - on va les créer progressivement
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const TestPage = React.lazy(() => import('@/pages/TestPage'));

// Modules
const HRDashboard = React.lazy(() => import('@/features/hr/pages/HRDashboard'));
const CRMDashboard = React.lazy(() => import('@/features/crm/pages/CRMDashboard'));
const FinanceDashboard = React.lazy(() => import('@/features/finance/pages/FinanceDashboard'));
const ProjectsDashboard = React.lazy(() => import('@/features/projects/pages/ProjectsDashboard'));
const InventoryDashboard = React.lazy(() => import('@/features/inventory/pages/InventoryDashboard'));
const AIDashboard = React.lazy(() => import('@/features/ai/pages/AIDashboard'));

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading screen component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Placeholder pour les autres pages
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">Cette page sera bientôt disponible</p>
    </div>
  </div>
);

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  console.log('PrivateRoute - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

export function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SupabaseAuthProvider>
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route
                    path="/*"
                    element={
                      <PrivateRoute>
                        <AppLayout>
                          <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/hr" element={<HRDashboard />} />
                            <Route path="/crm" element={<CRMDashboard />} />
                            <Route path="/finance" element={<FinanceDashboard />} />
                            <Route path="/projects" element={<ProjectsDashboard />} />
                            <Route path="/inventory" element={<InventoryDashboard />} />
                            <Route path="/ai" element={<AIDashboard />} />
                            <Route path="/settings" element={<ComingSoon title="Paramètres" />} />
                          </Routes>
                        </AppLayout>
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Toaster position="top-right" />
            <AppStatus />
          </SupabaseAuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Router>
  );
}