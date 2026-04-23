import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { KinnectAiWidget } from "@/components/ai/KinnectAiWidget";

const MainComponent: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-white pt-[calc(env(safe-area-inset-top))]   ">
      <Header />
      <main className="space-y-6 pt-[calc(env(safe-area-inset-top)+40px)]">
        <Outlet />
      </main>
      <KinnectAiWidget />
      <BottomNav />
    </div>
  );
};

export default MainComponent;
