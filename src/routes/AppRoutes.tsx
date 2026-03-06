import { LazyRoute } from "@/App";
import ChatPage from "@/pages/app/chat";
import ChatidPage from "@/pages/app/ChatIdPage";
import CommunityPage from "@/pages/app/community";
import HomePage from "@/pages/app/home";
import MatchProfile from "@/pages/app/MatchProfile";
import MyProfile from "@/pages/app/myProfile";
import FAQPage from "@/pages/app/faq";
import TermsPage from "@/pages/app/terms";
import PrivacyPolicyPage from "@/pages/app/privacy-policy";
import SubscriptionsPage from "@/pages/app/subscriptions";
import ProfilePage from "@/pages/app/profile";
import MainComponent from "@/pages/main";
import { Routes, Route } from "react-router-dom";

const AppRoutes = () => (
  <Routes>
    <Route element={<MainComponent />}>
      <Route index element={<LazyRoute Component={HomePage} />} />
      <Route
        path="community"
        element={<LazyRoute Component={CommunityPage} />}
      />
      <Route path="chats" element={<LazyRoute Component={ChatPage} />} />
      <Route path="profile" element={<LazyRoute Component={ProfilePage} />} />
    </Route>
    <Route
      path="chats/:channelId"
      element={<LazyRoute Component={ChatidPage} />}
    />
    <Route
      path="match_profile"
      element={<LazyRoute Component={MatchProfile} />}
    />
    <Route
      path="my-profile"
      element={<LazyRoute Component={MyProfile} />}
    />
    <Route path="faqs" element={<LazyRoute Component={FAQPage} />} />
    <Route path="terms" element={<LazyRoute Component={TermsPage} />} />
    <Route
      path="privacy-policy"
      element={<LazyRoute Component={PrivacyPolicyPage} />}
    />
    <Route
      path="subscriptions"
      element={<LazyRoute Component={SubscriptionsPage} />}
    />
  </Routes>
);

export default AppRoutes;
