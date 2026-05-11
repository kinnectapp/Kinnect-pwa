import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "../../assets/images/confetti.svg";
import { SuccessIcon } from "@/components/icons";
import useAuth from "@/api/auth";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { PersonalityTestPayload } from "@/lib/types/auth";
import { personalityQuestions } from "@/lib/utils/constants";

type PersonalityQuestion = {
  id: number;
  text: string;
};

const PERSONALITY_QUESTIONS: PersonalityQuestion[] = personalityQuestions.map(
  (item, index) => ({
    id: index + 1,
    text: item.question,
  }),
);

const OPTIONS = [
  "Totally Disagree",
  "Disagree",
  "Neutral",
  "Slightly Agree",
  "Fully Agree",
] as const;

type AnswerValue = 0 | 1 | 2 | 3 | 4;

const TOTAL_QUESTIONS = PERSONALITY_QUESTIONS.length;
const TRAIT_MAX_SCORE = 25;
const OVERALL_MAX_SCORE = 75;

const round = (value: number): number => Math.round(value);

const getFlag = (percentage: number): string => {
  if (percentage < 40) return "LOW";
  if (percentage < 70) return "MODERATE";
  return "HIGH";
};

const getTraitSummary = (trait: string, percentage: number): string => {
  if (percentage < 40) return `${trait} needs improvement.`;
  if (percentage < 70) return `${trait} is balanced.`;
  return `${trait} is a strong trait.`;
};

const getPersonalitySummary = (
  agreeablenessPercentage: number,
  conscientiousnessPercentage: number,
  neuroticismPercentage: number,
): string => {
  const traits = [
    { name: "agreeableness", value: agreeablenessPercentage },
    { name: "conscientiousness", value: conscientiousnessPercentage },
    { name: "neuroticism", value: neuroticismPercentage },
  ];

  const dominantTrait = traits.reduce((prev, current) =>
    current.value > prev.value ? current : prev,
  );

  return `Your dominant trait is ${dominantTrait.name}.`;
};

const buildPersonalityPayload = (
  answers: (AnswerValue | null)[],
): PersonalityTestPayload | null => {
  if (answers.some((answer) => answer === null)) {
    return null;
  }

  const scores = (answers as AnswerValue[]).map((value) => value + 1);

  if (scores.length !== 15) {
    console.error(`PersonalityTest: expected 15 answers, got ${scores.length}`);
    return null;
  }

  const agreeableness = scores.slice(0, 5);
  const conscientiousness = scores.slice(5, 10);
  const neuroticism = scores.slice(10, 15);

  const agreeablenessTotal = agreeableness.reduce((sum, item) => sum + item, 0);
  const conscientiousnessTotal = conscientiousness.reduce(
    (sum, item) => sum + item,
    0,
  );
  const neuroticismTotal = neuroticism.reduce((sum, item) => sum + item, 0);

  const personalityScore =
    agreeablenessTotal + conscientiousnessTotal + neuroticismTotal;

  const agreeablenessPercentage = round(
    (agreeablenessTotal / TRAIT_MAX_SCORE) * 100,
  );
  const conscientiousnessPercentage = round(
    (conscientiousnessTotal / TRAIT_MAX_SCORE) * 100,
  );
  const neuroticismPercentage = round((neuroticismTotal / TRAIT_MAX_SCORE) * 100);
  const personalityPercentage = round((personalityScore / OVERALL_MAX_SCORE) * 100);

  const personalitySummary = getPersonalitySummary(
    agreeablenessPercentage,
    conscientiousnessPercentage,
    neuroticismPercentage,
  );

  return {
    agreeablenessA: agreeableness[0],
    agreeablenessB: agreeableness[1],
    agreeablenessC: agreeableness[2],
    agreeablenessD: agreeableness[3],
    agreeablenessE: agreeableness[4],
    conscientiousnessA: conscientiousness[0],
    conscientiousnessB: conscientiousness[1],
    conscientiousnessC: conscientiousness[2],
    conscientiousnessD: conscientiousness[3],
    conscientiousnessE: conscientiousness[4],
    neuroticismA: neuroticism[0],
    neuroticismB: neuroticism[1],
    neuroticismC: neuroticism[2],
    neuroticismD: neuroticism[3],
    neuroticismE: neuroticism[4],
    personalityScore,
    personalitySummary,
    personalityPercentage,
    personalityFlag: getFlag(personalityPercentage),
    agreeablenessTotal,
    agreeablenessPercentage,
    agreeablenessSummary: getTraitSummary(
      "Agreeableness",
      agreeablenessPercentage,
    ),
    agreeablenessFlag: getFlag(agreeablenessPercentage),
    conscientiousnessTotal,
    conscientiousnessPercentage,
    conscientiousnessSummary: getTraitSummary(
      "Conscientiousness",
      conscientiousnessPercentage,
    ),
    conscientiousnessFlag: getFlag(conscientiousnessPercentage),
    neuroticismTotal,
    neuroticismPercentage,
    neuroticismSummary: getTraitSummary("Neuroticism", neuroticismPercentage),
    neuroticismFlag: getFlag(neuroticismPercentage),
    user: {},
  };
};

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
  const { useAddPersonalityMutation } = useAuth();
  const { mutate: addPersonality, isPending: isSubmitting } =
    useAddPersonalityMutation();

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
  const [completionSummary, setCompletionSummary] = React.useState(
    "Your reliability is a strength, but empathy and emotional stability are areas for improvement, and developing these skills will help you navigate challenging situations.",
  );

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
    if (!canContinue || isSubmitting) return;
    if (isLast) {
      const payload = buildPersonalityPayload(answers);
      if (!payload) {
        toast.error("Please answer all questions before submitting.");
        return;
      }

      addPersonality(payload, {
        onSuccess: (response: any) => {
          const apiSummary =
            response?.data?.personality?.personalitySummary ||
            response?.data?.user?.personalitySummary ||
            payload.personalitySummary;

          setCompletionSummary(apiSummary);
          setCompleted(true);
        },
        onError: (error: any) => {
          toast.error(handleApiError(error));
        },
      });
      return;
    }
    goToQuestion(currentIndex + 1);
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate("/onboarding/personality_intro");
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
        className="flex min-h-[100dvh] px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+2rem)]"
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
            {completionSummary}
          </div>

          <div className="mt-6 w-full space-y-5">
            <Button
              type="button"
              onClick={() => navigate("/onboarding/whats_next")}
              className="w-full "
            >
              Continue
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              onClick={() => navigate("/onboarding/book-session")}
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
    <div className="flex min-h-[100dvh] flex-col bg-[#1B0030] px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
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
        <h2 className="mt-3 text-[16px] font-medium leading-[28px]">
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
          disabled={!canContinue || isSubmitting}
          onClick={handleNext}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : isLast ? "Submit" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default PersonalityTest;
