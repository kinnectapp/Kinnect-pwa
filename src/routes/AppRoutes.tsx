import { LazyRoute } from "@/App";
import ChatPage from "@/pages/app/chat";
import CommunityPage from "@/pages/app/community";
import HomePage from "@/pages/app/home";
import ProfilePage from "@/pages/app/profile";
import MainComponent from "@/pages/main";
import { Routes, Route } from "react-router-dom";

const AppRoutes = () => (
  <Routes>
    <Route element={<MainComponent />}>
      <Route path="/" element={<LazyRoute Component={HomePage} />} />
      <Route
        path="community"
        element={<LazyRoute Component={CommunityPage} />}
      />
      <Route path="chats" element={<LazyRoute Component={ChatPage} />} />
      <Route path="profile" element={<LazyRoute Component={ProfilePage} />} />
    </Route>
  </Routes>
);

export default AppRoutes;
