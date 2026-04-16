import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Use react-router-dom
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuccessIcon } from "@/components/icons";
import { dealBreakerQuestions } from "@/lib/utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuth from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { DealBreakerPayload } from "@/lib/types/auth";
import { useGetProfile } from "@/services/profile.service";

interface DealBreakerQuestion {
  id: string;
  title: string;
  options: Array<{ item: string; mainKey: string }>;
}

const dealBreakerQuestionList: DealBreakerQuestion[] = [
  ...dealBreakerQuestions.map((question) => ({
    id: question.key,
    title: question.question.replace(/^Your Preferred /, "").replace(/\?$/, ""),
    options: question.options.map((option) => ({
      item: option.item,
      mainKey: option.mainKey,
    })),
  })),
];

export default function DealBreakers() {
  const location = useLocation(); // Get search params from location
  const navigate = useNavigate(); // For navigation
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { useAddDealBreakerMutation, useGetUserMutation } = useAuth();
  const { mutateAsync: addDealBreaker } = useAddDealBreakerMutation();
  const { mutateAsync: getUserById } = useGetUserMutation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [rankings, setRankings] = useState<
    Record<string, Record<string, number>>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialRankings = () => {
    const initialRankings: Record<string, Record<string, number>> = {};
    dealBreakerQuestionList.forEach((question) => {
      initialRankings[question.id] = {};
      question.options.forEach((_, index) => {
        initialRankings[question.id][index] = 0;
      });
    });
    return initialRankings;
  };

  // Initialize rankings from URL or localStorage
  useEffect(() => {
    // Get current question from URL
    const params = new URLSearchParams(location.search);
    const questionParam = params.get("question");
    if (questionParam) {
      const questionIndex = parseInt(questionParam);
      if (
        questionIndex >= 0 &&
        questionIndex < dealBreakerQuestionList.length
      ) {
        setCurrentQuestion(questionIndex);
      }
    }

    // Initialize rankings from localStorage
    const savedRankings = localStorage.getItem("dealBreakerRankings");
    if (savedRankings) {
      const parsedRankings = JSON.parse(savedRankings) as Record<
        string,
        Record<string, number>
      >;
      const mergedRankings = getInitialRankings();

      dealBreakerQuestionList.forEach((question) => {
        question.options.forEach((_, index) => {
          const value = parsedRankings?.[question.id]?.[index];
          mergedRankings[question.id][index] =
            typeof value === "number" ? value : 0;
        });
      });

      setRankings(mergedRankings);
    } else {
      const initialRankings = getInitialRankings();
      setRankings(initialRankings);
      localStorage.setItem(
        "dealBreakerRankings",
        JSON.stringify(initialRankings),
      );
    }
  }, [location.search]);

  const handleRankChange = (optionIndex: number, rank: number) => {
    const currentQ = dealBreakerQuestionList[currentQuestion];
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

  const buildPayload = (): DealBreakerPayload => {
    const payload = {
      preferredReligion: {},
      smokingRate: {},
      bodyType: {},
      complexion: {},
      education: {},
    } as DealBreakerPayload;

    dealBreakerQuestionList.forEach((question) => {
      question.options.forEach((option, index) => {
        const rank = rankings?.[question.id]?.[index] ?? 0;
        const normalizedMainKey =
          question.id === "preferredReligion" && option.mainKey === "islman"
            ? "islam"
            : option.mainKey;
        (
          payload[question.id as keyof DealBreakerPayload] as Record<
            string,
            number
          >
        )[normalizedMainKey] = rank;
      });
    });

    return payload;
  };

  const handleContinue = async () => {
    if (isSubmitting) return;

    if (currentQuestion < dealBreakerQuestionList.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      navigate(`?question=${nextQuestion}`); // Update the URL with the next question
    } else {
      try {
        setIsSubmitting(true);
        const payload = buildPayload();
        await addDealBreaker(payload);

        if (user?.id) {
          const userResponse = await getUserById(String(user.id));
          const fetchedUser = userResponse?.data?.resp;
          if (fetchedUser && typeof fetchedUser === "object") {
            await setUser(fetchedUser as any);
          }
        }

        toast.success("Deal breakers saved successfully.");
        setIsComplete(true);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsSubmitting(false);
      }
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

  const question = dealBreakerQuestionList[currentQuestion];
  const questionRankings = rankings[question.id] || {};

  return (
    <div className="min-h-[100dvh] bg-[#1E073A] text-white p-6 flex flex-col">
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
          {currentQuestion + 1} / {dealBreakerQuestionList.length}
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
                {option.item}
              </span>
            </div>

            {/* Dashed separator */}
            <div className="border-t border-dashed border-white/20 "></div>

            {/* Rank dropdown */}
            <div className="flex gap-1 items-center py-2 px-4 justify-between">
              <span className="text-gray-300 font-light text-[12px]">
                Rank:
              </span>
              <Select
                value={String(questionRankings[index] ?? 0)}
                onValueChange={(value) =>
                  handleRankChange(index, Number(value))
                }
              >
                <SelectTrigger className="h-8 w-full border-0 bg-transparent px-0 text-right text-white shadow-none focus:ring-0">
                  <SelectValue placeholder="--select option--" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((rank) => (
                    <SelectItem key={rank} value={String(rank)}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <Button onClick={handleContinue} disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}

function CompletionScreen() {
  const navigate = useNavigate();
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfile();

  const handleFindMatch = () => {
    // Check if personality test is completed
    if (!profileData?.personalityId) {
      navigate("/onboarding/takepersonalitytest");
      return;
    }

    // Check if required profile fields are set
    const requiredFields = ["religion", "education", "bodyType", "gender"];
    const missingFields = requiredFields.filter(
      (field) => !profileData?.[field as keyof typeof profileData],
    );

    if (missingFields.length > 0) {
      navigate("/onboarding/profile");
      return;
    }

    // All done, navigate to matches
    navigate("/app");
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
        <Button
          onClick={handleFindMatch}
          disabled={isLoadingProfile}
          className="w-full"
        >
          {isLoadingProfile ? "Loading..." : "Find A Match"}
        </Button>
      </div>
    </div>
  );
}
