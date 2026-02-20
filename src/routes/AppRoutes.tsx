import { LazyRoute } from "@/App";
import ChatPage from "@/pages/app/chat";
import ChatidPage from "@/pages/app/ChatIdPage";
import CommunityPage from "@/pages/app/community";
import HomePage from "@/pages/app/home";
import MatchProfile from "@/pages/app/MatchProfile";
import MyProfile from "@/pages/app/myProfile";
import ProfilePage from "@/pages/app/profile";
import MainComponent from "@/pages/main";
import { Routes, Route } from "react-router-dom";

const AppRoutes = () => (
  <Routes>
    <Route path="chat/:id" element={<LazyRoute Component={ChatidPage} />} />

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
      path="match_profile"
      element={<LazyRoute Component={MatchProfile} />}
    />
    <Route
      path="my-profile"
      element={<LazyRoute Component={MyProfile} />}
    />
  </Routes>
);

export default AppRoutes;
