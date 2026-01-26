 import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";
import { Button } from "@/components/ui/button";
const Communities = () => {
  const navigate = useNavigate();
  const Communities = [
    {
      name: "Relationship Advice",
      descriptions:
        "This community is dedicated to helping you find your footing in the ever changing world of dating, relationships, and love.",
    },
    {
      name: "Personal Development",
      descriptions:
        "From mindset shifts to habit formation, we're here to help you unlock your full potential.",
    },
    {
      name: "For Her",
      descriptions:
        "Learn how to build fulfilling relationships that honor your values, boundaries, and desires.",
    },
    {
      name: "For Him",
      descriptions:
        "Learn how to be a better man, and how to build real relationships that last.",
    },
  ];

  return (
    <div className="flex h-full flex-col px-6 pt-10 pb-8 bg-[#FFFFFF]">
      {/* logo */}
      <div className="flex justify-center">
        <img src={Logo} alt="Kinnect" className="h-12 w-12" />
      </div>

      {/* heading */}
      <div className="mt-6 mb-6 text-center">
        <h1 className="text-[24px] font-semibold text-[#1C1C1C]">
          Kinnect Communities
        </h1>
        <p className="mt-3 max-w-[350px] m-auto text-[14px] leading-relaxed text-[#1C1C1C]">
          Join our community where you can discuss your progress, share tips,
          and ask questions about relationships
        </p>
      </div>

      {Communities.map((data, i) => (
        <div
          key={i}
          className="border min-h-[180px] mb-5 rounded-[8px] p-4 bg-[#FBF8FF] border-[#55288D66]"
        >
          <p className="font-semibold mb-2 text-[18px] text-[#1C1C1C]">
            {data?.name}
          </p>
          <p className="text-[12px] mb-6 max-w-[90%]">{data.descriptions}</p>

          <Button className="h-[34px] w-full text-[12px]" variant={"secondary"}>
            Tap To Join
          </Button>
        </div>
      ))}

      {/* bottom area */}
      <div className="mt-6 space-y-2">
        <Button onClick={() => navigate("/app")} className="w-full">
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Communities;
