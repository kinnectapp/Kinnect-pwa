  import { LazyRoute } from "@/App";
import Login from "@/pages/auth/Login";
import Siignup from "@/pages/auth/Siignup";
 import { Routes, Route } from "react-router-dom";

const AuthRoutes = () => (
  <Routes>
    <Route path="/login" element={<LazyRoute Component={Login} />} />
     <Route path="/signup" element={<LazyRoute Component={Siignup} />} />
  </Routes>
);

export default AuthRoutes;
