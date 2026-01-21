import { LazyRoute } from "@/App";
import Communities from "@/pages/dealbreaker/Communities";
import DealBreakers from "@/pages/dealbreaker/Dealbreaker";
import DealbreakerPrompt from "@/pages/dealbreaker/DealbreakerPrompt";
import BookSession from "@/pages/onboarding/BookSession";
import BookSessionModal from "@/pages/onboarding/BookSessionModal";
import Interests from "@/pages/onboarding/Interests";
import Location from "@/pages/onboarding/Location";
import MakeConnectionPrompt from "@/pages/onboarding/MakeConnectionPrompt";
import Onboarding from "@/pages/onboarding/Onboarding";
import PersonalityIntro from "@/pages/onboarding/PersonalityIntro";
import PersonalityTest from "@/pages/onboarding/PersonalityTest";
import ProfileComplete from "@/pages/onboarding/ProfileComplete";
import ProfilePhoto from "@/pages/onboarding/ProfilePhoto";
import PersonalDetails from "@/pages/onboarding/ProfileSetup";
import SessionConfirmation from "@/pages/onboarding/SessionConfirmation";
import WhereNext from "@/pages/onboarding/WhereNext";
import { Routes, Route } from "react-router-dom";

const OnboardingRoutes = () => (
  <Routes>
    <Route path="/" element={<LazyRoute Component={Onboarding} />} />
    <Route path="/interests" element={<LazyRoute Component={Interests} />} />
    <Route
      path="/personality_intro"
      element={<LazyRoute Component={PersonalityIntro} />}
    />
    <Route
      path="/personality_test"
      element={<LazyRoute Component={PersonalityTest} />}
    />
    <Route path="/whats_next" element={<LazyRoute Component={WhereNext} />} />
    <Route
      path="/book-session"
      element={<LazyRoute Component={BookSession} />}
    />
    <Route
      path="/booksession"
      element={<LazyRoute Component={BookSessionModal} />}
    />
    <Route
      path="/profile-setup"
      element={<LazyRoute Component={PersonalDetails} />}
    />
    <Route
      path="/session-confirmation"
      element={<LazyRoute Component={SessionConfirmation} />}
    />
    <Route
      path="/connection_getstarted"
      element={<LazyRoute Component={MakeConnectionPrompt} />}
    />
    <Route path="/location" element={<LazyRoute Component={Location} />} />
    <Route
      path="/profile-photo"
      element={<LazyRoute Component={ProfilePhoto} />}
    />
    <Route
      path="/profile-complete"
      element={<LazyRoute Component={ProfileComplete} />}
    />
    <Route
      path="/dealbreaker"
      element={<LazyRoute Component={DealbreakerPrompt} />}
    />
    <Route
      path="/dealbreaker_q"
      element={<LazyRoute Component={DealBreakers} />}
    />{" "}
    <Route
      path="/communities"
      element={<LazyRoute Component={Communities} />}
    />
  </Routes>
);

export default OnboardingRoutes;
