import { LazyRoute } from "@/App";
import Splash from "@/pages/auth/Splash";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const SplashRoutes = () => (
  <Routes>
    <Route path="/" element={<LazyRoute Component={Splash} />} />
  </Routes>
);

export default SplashRoutes;
