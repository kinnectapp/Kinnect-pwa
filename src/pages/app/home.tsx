import React from "react";
import { ChevronRight, MessageSquare } from "lucide-react";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}

      {/* Main Content */}
      <main className="px-4 space-y-6">
        {/* Welcome Section */}
        <section>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Tade</h1>
          <p className="text-gray-600 text-sm mt-1">
            Discover and engage with potential matches who share your values and interests.
          </p>
        </section>

        {/* Make Connections Card */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Make Connections</h2>
              <p className="text-white/80 text-sm mt-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </section>

        {/* Book A Coaching Session */}
        <section className="flex items-center justify-between py-3 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Book A Coaching Session</h3>
              <p className="text-gray-500 text-sm">Book now to talk to an expert</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-pink-500 group-hover:translate-x-1 transition-transform" />
        </section>

        {/* Kinnect Communities */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Kinnect Communities</h2>
          {/* <div className="grid grid-cols-2 gap-3">
            {communities.map((community) => (
              <CommunityCard
                key={community.title}
                title={community.title}
                members={community.members}
                image={community.image}
              />
            ))}
          </div> */}
        </section>

        {/* Subscribe to Premium Plan */}
        <section className="bg-gradient-to-r from-purple-700 to-purple-600 rounded-2xl p-4 flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              {/* <KinnectLogo className="h-6 w-6" /> */}
            </div>
            <h3 className="font-semibold text-white">Subscribe to Premium Plan</h3>
          </div>
          <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
        </section>
      </main>
    </div>
  );
};

export default HomePage;