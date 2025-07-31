import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/contexts/theme-context';
import { SupabaseAuthProvider } from '@/providers/supabase-auth-provider';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/providers/supabase-auth-provider';
import { Toaster } from 'sonner';
import { AppStatus } from '@/components/AppStatus';

// Pages - on va les créer progressivement
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const TestPage = React.lazy(() => import('@/pages/TestPage'));

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
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }
            >
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
                          <Route path="/hr" element={<ComingSoon title="Module HR" />} />
                          <Route path="/crm" element={<ComingSoon title="Module CRM" />} />
                          <Route path="/finance" element={<ComingSoon title="Module Finance" />} />
                          <Route path="/projects" element={<ComingSoon title="Module Projets" />} />
                          <Route path="/inventory" element={<ComingSoon title="Module Inventaire" />} />
                          <Route path="/ai" element={<ComingSoon title="Module IA" />} />
                          <Route path="/settings" element={<ComingSoon title="Paramètres" />} />
                        </Routes>
                      </AppLayout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </React.Suspense>
            
            <Toaster 
              position="bottom-right"
              richColors
              expand={true}
              duration={4000}
            />
            <AppStatus />
          </SupabaseAuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Router>
  );
}