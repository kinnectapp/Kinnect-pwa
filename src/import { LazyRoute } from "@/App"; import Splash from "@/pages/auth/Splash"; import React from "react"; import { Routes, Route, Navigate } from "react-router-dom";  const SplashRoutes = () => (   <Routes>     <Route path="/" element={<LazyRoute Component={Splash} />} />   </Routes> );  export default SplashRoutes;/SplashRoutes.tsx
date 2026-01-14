import { LazyRoute } from "@/App";
import Splash from "@/pages/auth/Splash";
import { Routes, Route } from "react-router-dom";

const SplashRoutes = () => (
  <Routes>
    <Route path="/" element={<LazyRoute Component={Splash} />} />
  </Routes>
);

export default SplashRoutes;
