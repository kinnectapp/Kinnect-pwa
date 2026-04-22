import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { KinnectAiWidget } from "@/components/ai/KinnectAiWidget";

const MainComponent: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-white pb-[calc(75px+env(safe-area-inset-bottom))]">
      <Header />
      <main className="  space-y-6">
        <Outlet />
      </main>
      <KinnectAiWidget provider="openai" />
      <BottomNav />
    </div>
  );
};

export default MainComponent;
