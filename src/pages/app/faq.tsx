import React from "react";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/layout/logo";

const FAQ_ITEMS = [
  {
    question: "Is Kinnect free to use?",
    answer:
      "Yes, downloading and using Kinnect is free. Some premium features, however, require a subscription.",
  },
  {
    question: "Can I delete my profile?",
    answer: "Yes, you can delete your profile at any time.",
  },
  {
    question: "How does Kinnect match users?",
    answer:
      "Kinnect uses an algorithm to match users based on your deal breakers, personality test, preferences and interests.",
  },
  {
    question: "Can I choose my own matches?",
    answer:
      "No. The system provides you with 3 tailored matches and you decide on which of them to proceed with.",
  },
  {
    question: "What is the 7 Days Talking Stage?",
    answer:
      "This is the period where a user gets to chat with other matched users and before deciding on who to proceed with.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes, Kinnect takes user safety and security seriously and follows best practices to protect your data.",
  },
  {
    question: "How do I report a suspicious user?",
    answer:
      "You can report a matched user by using the Report feature on their profile.",
  },
  {
    question: "What devices is Kinnect available on?",
    answer: "Kinnect is available on both iOS and Android devices.",
  },
  {
    question: "I'm experiencing technical issues. What should I do?",
    answer: "Please contact our support team for assistance.",
  },
  {
    question: "Does Kinnect offer premium features?",
    answer: "Yes, Kinnect offers premium features for subscribers.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription through your account settings or contact our support team.",
  },
];

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = React.useState<Record<number, boolean>>({});

  const toggle = (index: number) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F5F7]  pb-[calc(env(safe-area-inset-bottom)+40px)]">
      <div className="bg-white pt-[calc(env(safe-area-inset-top)+20px)] px-4 pb-4">
        <div className=" flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
          >
            <ChevronLeft size={18} className="text-[#5A2B8D]" />
          </button>

          <Logo />

          <div className="w-9" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#450f77] via-[#65195c70] to-[#7e016b] px-6 py-7 text-center">
        <h1 className="text-[28px] font-semibold leading-[1.1] text-white">
          Frequently Asked
          <br />
          Questions (FAQs)
        </h1>
      </div>

      <div className="space-y-3 px-4 pt-6">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = Boolean(openItems[index]);

          return (
            <div
              key={item.question}
              className="rounded-[8px] border border-[#D9CDE8] bg-white"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <span className="pr-4 text-[14px] font-medium text-[#1C1C1C]">
                  {item.question}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#55288D] text-white">
                  {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                </span>
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-[12px] leading-[1.45] text-[#6E6A75]">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQPage;
