import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyForgotPassword from "@/pages/auth/VerifyForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Register from "@/pages/auth/Register";
import VerifyRegister from "@/pages/auth/VerifyRegister";
import SetPassword from "@/pages/auth/SetPassword";

const AuthRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/auth/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/forgot-password/verify" element={<VerifyForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/set-password" element={<SetPassword />} />
    <Route path="/register" element={<Register />} />
    <Route path="/register/verify" element={<VerifyRegister />} />
  </Routes>
);

export default AuthRoutes;
