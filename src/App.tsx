import React, { Suspense } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SplashRoutes from "./routes/SplashRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import { PWAUpdatePrompt } from "./components/pwa/PWAUpdatePrompt";
import OnboardingRoutes from "./routes/OnboardingRoutes";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";

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

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<SplashRoutes />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/onboarding/*" element={<OnboardingRoutes />} />
        <Route path="/app/*" element={<AppRoutes />} />
      </Routes>

      <Toaster position="top-right" />
      <PWAUpdatePrompt />
    </BrowserRouter>
  );
};

export default App;
