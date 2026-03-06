import React, { Suspense, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SplashRoutes from "./routes/SplashRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import { PWAUpdatePrompt } from "./components/pwa/PWAUpdatePrompt";
import OnboardingRoutes from "./routes/OnboardingRoutes";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/auth.store";
import { StreamChatProvider } from "./providers/StreamChatProvider";

export const Fallback: React.FC = () => (
  <div className="flex min-h-[70vh] w-full flex-1 items-center justify-center bg-white">
    <span className="loader"></span>
  </div>
);

type LazyRouteProps = {
  Component: React.ComponentType<any>;
};

export const LazyRoute: React.FC<LazyRouteProps> = ({ Component }) => (
  <Suspense fallback={<Fallback />}>
    <Component />
  </Suspense>
);

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <Fallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<SplashRoutes />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route
          path="/onboarding/*"
          element={
            <RequireAuth>
              <OnboardingRoutes />
            </RequireAuth>
          }
        />
        <Route
          path="/app/*"
          element={
            <RequireAuth>
              <StreamChatProvider>
                <AppRoutes />
              </StreamChatProvider>
            </RequireAuth>
          }
        />
      </Routes>

      <Toaster position="top-right" />
      <PWAUpdatePrompt />
    </BrowserRouter>
  );
};

export default App;
