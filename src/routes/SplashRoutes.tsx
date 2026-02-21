import { LazyRoute } from "@/App";
import Splash from "@/pages/auth/Splash";
import { useAuthStore } from "@/store/auth.store";
import { Navigate, Route, Routes } from "react-router-dom";

const SplashRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<LazyRoute Component={Splash} />} />
    </Routes>
  );
};

export default SplashRoutes;
