import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Use react-router-dom
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessIcon } from "@/components/icons";

interface DealBreakerQuestion {
  id: string;
  title: string;
  options: string[];
}

const dealBreakerQuestions: DealBreakerQuestion[] = [
  {
    id: "religion",
    title: "Religion",
    options: [
      "Catholic",
      "Protestant",
      "Pentecostal",
      "Islam",
      "Agnostic",
      "Others",
    ],
  },
  {
    id: "religion2",
    title: "Religion",
    options: [
      "Catholic",
      "Protestant",
      "Pentecostal",
      "Islam",
      "Agnostic",
      "Others",
    ],
  },
  {
    id: "education",
    title: "Education",
    options: ["SSCE", "OND", "HND", "B.Sc.", "M.Sc.", "Ph.D"],
  },
  {
    id: "smoking-habit",
    title: "Smoking Habit",
    options: [
      "Smoker",
      "Smoke Sometimes",
      "Rarely Smokes",
      "Don't Smoke",
      "Trying To Quit",
      "Neutral",
    ],
  },
  {
    id: "completion",
    title: "Completion",
    options: [
      "Dark Melanin",
      "Chocolate",
      "Fair Melanin",
      "Mixed Race",
      "Asian",
      "Caucasian",
    ],
  },
  {
    id: "body-type",
    title: "Body Type",
    options: [
      "Athletic",
      "Chubby",
      "Average Build",
      "Slim",
      "Small Stature",
      "Neutral",
    ],
  },
  {
    id: "age",
    title: "Age",
    options: [
      "Age 19 - 24",
      "Age 25 - 29",
      "Age 30 - 34",
      "Age 35 - 39",
      "Age 40 - 49",
      "Age 50+",
    ],
  },
];

export default function DealBreakers() {
  const location = useLocation(); // Get search params from location
  const navigate = useNavigate(); // For navigation

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [rankings, setRankings] = useState<
    Record<string, Record<string, number>>
  >({});
  const [isComplete, setIsComplete] = useState(false);

  // Initialize rankings from URL or localStorage
  useEffect(() => {
    // Get current question from URL
    const params = new URLSearchParams(location.search);
    const questionParam = params.get("question");
    if (questionParam) {
      const questionIndex = parseInt(questionParam);
      if (questionIndex >= 0 && questionIndex < dealBreakerQuestions.length) {
        setCurrentQuestion(questionIndex);
      }
    }

    // Initialize rankings from localStorage
    const savedRankings = localStorage.getItem("dealBreakerRankings");
    if (savedRankings) {
      setRankings(JSON.parse(savedRankings));
    } else {
      const initialRankings: Record<string, Record<string, number>> = {};
      dealBreakerQuestions.forEach((question) => {
        initialRankings[question.id] = {};
        question.options.forEach((_, index) => {
          initialRankings[question.id][index] =
            index === 0
              ? 4
              : index === 1
                ? 1
                : index === question.options.length - 1
                  ? 2
                  : 0;
        });
      });
      setRankings(initialRankings);
    }
  }, [location.search]);

  const handleRankChange = (optionIndex: number, rank: number) => {
    const currentQ = dealBreakerQuestions[currentQuestion];
    setRankings((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        [optionIndex]: rank,
      },
    }));

    // Save to localStorage
    const newRankings = {
      ...rankings,
      [currentQ.id]: {
        ...rankings[currentQ.id],
        [optionIndex]: rank,
      },
    };
    localStorage.setItem("dealBreakerRankings", JSON.stringify(newRankings));
  };

  const handleContinue = () => {
    if (currentQuestion < dealBreakerQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      navigate(`?question=${nextQuestion}`); // Update the URL with the next question
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      navigate(`?question=${prevQuestion}`); // Update the URL with the previous question
    }
  };

  if (isComplete) {
    return <CompletionScreen />;
  }

  const question = dealBreakerQuestions[currentQuestion];
  const questionRankings = rankings[question.id] || {};

  return (
    <div className="min-h-screen bg-[#1E073A] text-white p-6 flex flex-col">
      {/* Decorative elements */}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="bg-gray-700/50 hover:bg-gray-600/50 p-2 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[14px] font-semibold tracking-wide">
          Deal Breakers
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Progress */}
      <div className="relative z-10 text-center mb-2">
        <p className="text-sm  text-gray-300">
          {currentQuestion + 1} / {dealBreakerQuestions.length}
        </p>
      </div>

      {/* Question Title */}
      <div className="relative z-10 mb-8">
        <h2 className="text-[18px] font-medium text-center">
          {question.title}
        </h2>
      </div>

      {/* Options */}
      <div className="relative z-10 flex-1 space-y-4 mb-8 ">
        {question.options.map((option, index) => (
          <div
            key={index}
            className="bg-[#291444] border border-[#3F2B57] rounded-[8px]   hover:bg-white/10 transition"
          >
            {/* Option title with pink dot */}
            <div className="flex items-center gap-3 py-2 px-4">
              <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
              <span className="text-[14px] font-medium text-white">
                {option}
              </span>
            </div>

            {/* Dashed separator */}
            <div className="border-t border-dashed border-white/20 "></div>

            {/* Rank dropdown */}
            <div className="flex gap-1 items-center py-2 px-4 justify-between">
              <span className="text-gray-300 font-light text-[12px]">
                Rank:
              </span>
              <select
                value={questionRankings[index] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== "") {
                    handleRankChange(index, parseInt(value));
                  }
                }}
                className="bg-transparent  border-0 flex-1 text-white font-medium cursor-pointer focus:outline-none focus:ring-0 appearance-none text-right pr-6"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  paddingRight: "24px",
                }}
              >
                <option value="" className="bg-gray-900 text-gray-300">
                  --select option--
                </option>
                {[0, 1, 2, 3, 4, 5].map((rank) => (
                  <option
                    key={rank}
                    value={rank}
                    className="bg-gray-900 text-white"
                  >
                    {rank}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <Button onClick={handleContinue}>Continue</Button>
    </div>
  );
}

function CompletionScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-20 w-2 h-6 bg-yellow-400 transform -rotate-45"></div>
        <div className="absolute top-20 left-40 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute top-32 right-32 w-3 h-3 bg-purple-400 rounded-full"></div>
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-pink-400 rounded-full"></div>
        <div className="absolute top-20 right-20 w-2.5 h-2.5 bg-green-400 rounded-full"></div>
        <div className="absolute top-28 right-1/3 w-2 h-2 bg-orange-400 rounded-full"></div>
        <div className="absolute top-44 left-1/2 w-2 h-2 bg-pink-300 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Checkmark Icon */}
        <div className="flex justify-center mb-4">
          <SuccessIcon />
        </div>

        {/* Heading */}
        <h1 className="text-[24px] font-semibold text-gray-900">
          Deal Breakers Set
        </h1>

        {/* Description */}
        <p className="text-gray-700 text-[14px] max-w-2xl leading-relaxed">
          You've successfully set your deal breakers! Your preferences will now
          be used to match you with like-minded individuals who share your
          values and interests.
        </p>

        {/* Find A Match Button */}
        <Button onClick={() => navigate("/onboarding/communities")} className="w-full">
          Find A Match
        </Button>
      </div>
    </div>
  );
}
