import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyForgotPassword from "@/pages/auth/VerifyForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Register from "@/pages/auth/Register";
import VerifyRegister from "@/pages/auth/VerifyRegister";
import SetPassword from "@/pages/auth/SetPassword";
import { useAuthStore } from "@/store/auth.store";

const AuthRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/app" replace /> : <Login />
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/forgot-password/verify"
        element={<VerifyForgotPassword />}
      />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/app" replace /> : <Register />
        }
      />
      <Route path="/register/verify" element={<VerifyRegister />} />
    </Routes>
  );
};

export default AuthRoutes;
