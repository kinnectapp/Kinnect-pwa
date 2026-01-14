import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";

const ALL_INTERESTS = [
  "Reading",
  "Dancing",
  "Shopping",
  "Photography & Videography",
  "Sports",
  "Art",
  "Gardening",
  "Music",
  "Movies",
  "Pottery",
  "Exercise",
  "Meditation",
  "Festivals",
  "Politics",
  "Board Games",
  "Cooking",
  "Cars",
  "Travelling",
  "Clubbing",
  "Pets",
  "Singing",
  "Nature",
] as const;

const Interests: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<string[]>([]);

  const toggleInterest = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const canSubmit = selected.length >= 5;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // send selected interests to API / context here
    // console.log(selected);
    navigate("/onboarding/personality_intro"); // change to your next route
  };

  return (
    <div className="flex h-full flex-col px-6 pt-10 pb-8 bg-[#FFFFFF]">
      {/* logo */}
      <div className="flex justify-center">
        <img src={Logo} alt="Kinnect" className="h-12 w-12" />
      </div>

      {/* heading */}
      <div className="mt-6 text-center">
        <h1 className="text-[24px] font-semibold text-[#1C1C1C]">
          Choose Your Interests
        </h1>
        <p className="mt-3 max-w-[350px] m-auto text-[14px] leading-relaxed text-[#1C1C1C]">
          Choose at least 5 things you like. This will help you find people with
          similar interests.
        </p>
      </div>

      {/* pills */}
      <div className="flex mt-6 flex-wrap gap-3 justify-center">
        {ALL_INTERESTS.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleInterest(item)}
              className={[
                " rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                "border",
                active
                  ? "border-transparent bg-[#D400B3] text-white  "
                  : "border-[#54278C26] bg-[#FAF8FB] text-[#55288D]",
              ].join(" ")}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* bottom area */}
      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={[
            "w-full mt-4 rounded-full px-6 py-3 text-[15px] font-semibold",
            "transition-opacity",
            canSubmit
              ? "bg-[#55288D] text-white "
              : "bg-[#E9E1FF] text-[#A59AD0] opacity-80",
          ].join(" ")}
        >
          Submit
        </button>

        
      </div>
    </div>
  );
};

export default Interests;
