import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

const MainComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      <main className="px-4 space-y-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainComponent;