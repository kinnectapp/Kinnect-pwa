import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  PERSONALITY_QUESTIONS,
  PersonalityQuestion,
} from "@/data/personality-questions";
import { Button } from "@/components/ui/button";
import Confetti from "../../assets/images/confetti.svg";
import BgPattern from "../../assets/images/onboarding-pattern.svg";
import { SuccessIcon } from "@/components/icons";

const OPTIONS = [
  "Totally Disagree",
  "Disagree",
  "Neutral",
  "Slightly Agree",
  "Fully Agree",
] as const;

type AnswerValue = 0 | 1 | 2 | 3 | 4;

const TOTAL_QUESTIONS = PERSONALITY_QUESTIONS.length;

const getCircleColors = (optionIndex: number, selected: boolean) => {
  if (!selected) {
    switch (optionIndex) {
      case 0:
        return "border-[#D400B3] text-white"; // magenta ring
      case 1:
        return "border-[#8B0382] text-white";
      case 2:
        return "border-[#6B5D7D] text-white";
      case 3:
        return "border-[#FEA57D] text-white";
      case 4:
        return "border-[#BBBEA0] text-white";
      default:
        return "border-white text-white";
    }
  }

  // selected state: filled with their color
  switch (optionIndex) {
    case 0:
      return "border-[#D400B3] bg-[#D400B3]";
    case 1:
      return "border-[#8B0382] bg-[#8B0382]";
    case 2:
      return "border-[#6B5D7D] bg-[#6B5D7D]";
    case 3:
      return "border-[#FEA57D] bg-[#FEA57D]";
    case 4:
      return "border-[#BBBEA0] bg-[#BBBEA0]";
    default:
      return "border-white bg-white";
  }
};

const PersonalityTest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const qParam = Number(searchParams.get("q"));

  // ensure we always have a valid ?q in the URL
  React.useEffect(() => {
    if (!qParam || Number.isNaN(qParam) || qParam < 1) {
      setSearchParams({ q: "1" });
    } else if (qParam > TOTAL_QUESTIONS) {
      setSearchParams({ q: String(TOTAL_QUESTIONS) });
    }
  }, [qParam, setSearchParams]);

  const currentIndex = React.useMemo(() => {
    if (!qParam || Number.isNaN(qParam) || qParam < 1) return 0;
    if (qParam > TOTAL_QUESTIONS) return TOTAL_QUESTIONS - 1;
    return qParam - 1; // URL is 1-based, index is 0-based
  }, [qParam]);

  const [answers, setAnswers] = React.useState<(AnswerValue | null)[]>(() =>
    Array(TOTAL_QUESTIONS).fill(null)
  );
  const [completed, setCompleted] = React.useState(false);

  const currentQuestion: PersonalityQuestion =
    PERSONALITY_QUESTIONS[currentIndex];

  const handleSelect = (optionIndex: AnswerValue) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = optionIndex;
      return copy;
    });
  };

  const canContinue = answers[currentIndex] !== null;
  const isLast = currentIndex === TOTAL_QUESTIONS - 1;

  const goToQuestion = (index: number) => {
    setSearchParams({ q: String(index + 1) });
  };

  const handleNext = () => {
    if (!canContinue) return;
    if (isLast) {
      setCompleted(true);
      return;
    }
    goToQuestion(currentIndex + 1);
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate("/quiz/personality-intro");
      return;
    }
    goToQuestion(currentIndex - 1);
  };

  if (completed) {
    return (
      <div
        style={{
          backgroundImage: `url(${Confetti})`,
          backgroundSize: "contain",
        }}
        className="h-[100dvh]  flex  px-6 pt-8 pb-6 "
      >
        <div className="flex flex-1 gap-3 justify-center flex-col items-center">
          <SuccessIcon />
          <h2 className="text-center  text-[24px] font-semibold text-[#1C1C1C]">
            Personality Test Completed
          </h2>
          <p className="mt-3 text-center text-[14px] max-w-[350px] mx-auto leading-relaxed text-[#1C1C1C]">
            Great job! Our algorithm will combine your test results with your
            deal breakers and interests to find your most compatible matches.
          </p>

          <div className="mt-5 w-full rounded-2xl bg-[#FAF8FB] max-w-[350px] text-center px-4 py-3 text-[14px] leading-relaxed text-[#1C1C1C] border border-[#54278C26]">
            Your reliability is a strength, but empathy and emotional stability
            are areas for improvement, and developing these skills will help you
            navigate challenging situations.
          </div>

          <div className="mt-6 w-full space-y-5">
            <Button
              type="button"
              onClick={() => navigate("/app/home")}
              className="w-full "
            >
              Continue
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              onClick={() => navigate("/app/chat-expert")}
              className="w-full"
            >
              Chat with an expert
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // main question UI
  return (
    <div className="flex h-[100dvh] flex-col bg-[#1B0030] px-6 pt-6 pb-8">
      {/* header */}
      <div className="flex items-center justify-between text-white">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6B5D7D]"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[14px] font-[600]">Personality Test</span>
        <div className="w-9" />
      </div>

      {/* progress + question */}
      <div className="mt-8 text-left text-white">
        <p className="text-[14px] text-[#C7C1CE]">
          Question {currentQuestion.id} / {TOTAL_QUESTIONS}
        </p>
        <h2 className="mt-3 text-[18px] font-medium leading-[28px]">
          {currentQuestion.text}
        </h2>
      </div>

      {/* options */}
      <div className="mt-10 flex flex-1 flex-col gap-4">
        {OPTIONS.map((label, index) => {
          const selected = answers[currentIndex] === index;
          const circleClasses = getCircleColors(index, !!selected);

          return (
            <button
              key={label}
              type="button"
              onClick={() => handleSelect(index as AnswerValue)}
              className="flex items-center gap-4 text-left"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${circleClasses}`}
              >
                {!selected && (
                  <span className="h-4 w-4 rounded-full bg-transparent" />
                )}
              </span>
              <span
                className={`text-[14px] font-medium ${
                  selected ? "text-white" : "text-[#D1C4E9]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* bottom button */}
      <div className="mt-6">
        <Button
          type="button"
          disabled={!canContinue}
          onClick={handleNext}
          className="w-full"
        >
          {isLast ? "Submit" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default PersonalityTest;
