import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/http";

type Community = {
  id: number;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
};

type CommunitiesResponse = {
  data?: {
    data?: Community[];
  };
};

const Communities = () => {
  const navigate = useNavigate();

  const { data: communitiesResponse, isLoading: isLoadingCommunities } =
    useQuery({
      queryKey: ["active-communities"],
      queryFn: async () => {
        const response = await http.get<CommunitiesResponse>(
          "/community?isActive=true",
        );
        return response.data;
      },
    });
  const communities = (communitiesResponse?.data?.data ?? []).slice(0, 4);

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

      {communities.map((community: any) => (
        <div
          key={community.id}
          className="border flex flex-col justify-between min-h-[180px] mb-5 rounded-[8px] p-4 bg-[#FBF8FF] border-[#55288D66]"
        >
        <div className="">
            <p className="font-semibold mb-2 text-[18px] text-[#1C1C1C]">
            {community.name}
          </p>
          <p className="text-[12px] mb-6 max-w-[90%]">{community.description}</p>
        </div>

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
