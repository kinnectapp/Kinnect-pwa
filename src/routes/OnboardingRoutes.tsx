import { LazyRoute } from "@/App";
import Interests from "@/pages/onboarding/Interests";
import Onboarding from "@/pages/onboarding/Onboarding";
import PersonalityIntro from "@/pages/onboarding/PersonalityIntro";
import PersonalityTest from "@/pages/onboarding/PersonalityTest";
import { Routes, Route } from "react-router-dom";

const OnboardingRoutes = () => (
  <Routes>
    <Route path="/" element={<LazyRoute Component={Onboarding} />} />
    <Route
      path="/interests"
      element={<LazyRoute Component={Interests} />}
    />
     <Route
      path="/personality_intro"
      element={<LazyRoute Component={PersonalityIntro} />}
    />
    <Route
      path="/personality_test"
      element={<LazyRoute Component={PersonalityTest} />}
    />
  </Routes>
);

export default OnboardingRoutes;
