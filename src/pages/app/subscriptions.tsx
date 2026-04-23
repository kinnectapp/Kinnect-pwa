import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PremiumIcon, StandardIcon, VipIcon } from "@/components/icons";

type Plan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  icon: React.ReactNode;
};

const plans: Plan[] = [
  {
    name: "Lifetime",
    price: "N150,000",
    period: "one-time",
    features: [
      "Smart and priority matching, 3 per week",
      "Incognito, full profile and compatibility insights",
      "Unlimited and personalized Kiki responses",
      "Full access to personalized coaching and events",
      "Guaranteed invitation and access",
      "Cocktail vouchers for first date",
    ],
    icon: <VipIcon />,
  },
  {
    name: "VIP",
    price: "N50,000",
    period: "/ month",
    features: [
      "Smart and priority matching, 3 per week",
      "Incognito, full profile and compatibility insights",
      "Unlimited personalized responses with Kiki",
      "Full access to personalized coaching and live coach support",
      "Raffled sponsorship for first dates",
      "Guaranteed invitation and access",
    ],
    icon: <PremiumIcon />,
  },
  {
    name: "Standard",
    price: "N5,000",
    period: "/ month",
    features: [
      "3 curated matches per week",
      "Incognito with profile access, names and faces unseen",
      "Limited Kiki access with guided responses",
      "Full community access to post, host, and join events",
      "Eligible to purchase event tickets, no guarantee",
      "Incognito option available from day 4",
    ],
    icon: <StandardIcon />,
  },
];

const SubscriptionCard: React.FC<{ plan: Plan }> = ({ plan }) => (
  <div className="overflow-hidden rounded-[10px] bg-gradient-to-r from-[#240044] via-[#3B1A69] to-[#7D007A] text-white">
    <div className="relative px-4 pb-4 pt-5">
      <div className="absolute right-4 top-4">{plan.icon}</div>
      <h3 className="text-[18px] font-semibold">{plan.name}</h3>
      <ul className="mt-3 space-y-2 text-[12px] text-[#C7C1CE]">
        {plan.features.map((feature) => (
          <li key={feature}>- {feature}</li>
        ))}
      </ul>
    </div>
    <div className="my-4 border-y border-white/20 px-4 py-3">
      <p className="text-[22px] font-semibold leading-none">
        {plan.price}{" "}
        <span className="text-[14px] font-normal text-white/80">
          {plan.period}
        </span>
      </p>
    </div>
    <div className="px-4 pb-4 pt-3">
      <button
        type="button"
        className="h-11 w-full rounded-full bg-white text-[12px] font-semibold text-[#55288D]"
      >
        Get Started
      </button>
    </div>
  </div>
);

const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#fff] pb-[calc(env(safe-area-inset-bottom)+40px)]">
      <div className="sticky top-0 z-10 bg-[#fff] px-4 pb-3 pt-[calc(env(safe-area-inset-top)+20px)]">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
          >
            <ChevronLeft size={18} className="text-[#5A2B8D]" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#55288D]">
            Subscriptions
          </h1>
        </div>
      </div>

      <div className="mt-6 space-y-4 px-4">
        <div className="rounded-[10px] border border-[#DECFEA] bg-[#FAF8FB] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[#1C1C1C]">
              Fremium
            </h2>
            <p className="text-[12px] font-semibold text-[#D400B3]">
              - Current Plan
            </p>
          </div>
          <p className="mt-3 text-[12px] leading-[1.5] text-[#6E6A75]">
            Enjoy 3 curated matches per week, incognito profile access with
            names and faces unseen, read-only community access, and always-on
            blur mode for incognito settings.
          </p>
        </div>

        {plans.map((plan) => (
          <SubscriptionCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
