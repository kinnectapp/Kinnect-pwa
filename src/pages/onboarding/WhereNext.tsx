 import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.svg";
import {
  BookSessionIcon,
  CommunityIcon,
  MakeConnectionIcon,
  WhereNextCoinIcon,
} from "@/components/icons";
import { ArrowRight } from "lucide-react";
import BgPattern from "../../assets/images/onboarding-pattern.svg";

const WhereNext = () => {
const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundImage: `url(${BgPattern})`,

        backgroundSize: "contain",
      }}
      className="flex h-full items-center flex-col  pt-10 pb-8 bg-[#FFFFFF]"
    >
      <img src={Logo} alt="Kinnect" className="h-12 w-12" />

      <h2 className="text-2xl mt-6 font-bold">Where Next?</h2>
      <p className="mt-2 max-w-[80%] mb-4 p-4 text-[14px] text-center text-[#1C1C1C]">
        Choose one of the options below to direct your journey in the Kinnect
        app.
      </p>
      <div onClick={
        //navigate to kiki 
        ()=>navigate("/app/kinnect-ai", { state: { provider: "gemini" } })
      } className="flex cursor-pointer p-4 justify-between items-center bg-[#600051] text-[#fff] w-full">
        <div className="flex items-center gap-4">
          <WhereNextCoinIcon />
          <div className="">
            <div className="font-semibold text-[16px]">
              Get Personalized Direction
            </div>

            <div className="text-[12px]">Chat with Kiki</div>
          </div>
        </div>
        <ArrowRight />
      </div>

      <div className=" mt-2  p-4 w-full ">
        <Link to="/onboarding/booksession">
          <div className=" mb-6 text-[#fff] bg-gradient-to-r from-[#850070]  via-[#2B042599] to-[#55288D] p-4 rounded-[8px] w-full">
            <BookSessionIcon />
            <div className="font-semibold text-[18px] mt-4 mb-2 ">
              Book A Session
            </div>

            <p className="text-[12px] max-w-[90%]">
              Schedule time with a relationship expert for personalized advice
              and support.
            </p>
          </div>
        </Link>

        <Link to="/onboarding/community">
          <div className=" mb-6 text-[#fff] background-gradient  p-4 rounded-[8px] w-full">
            <CommunityIcon />
            <div className="font-semibold text-[18px] mt-4 mb-2 ">
              Join A Community
            </div>

            <p className="text-[12px] max-w-[90%]">
              Connect with like-minded individuals to share experiences and grow
              together.
            </p>
          </div>{" "}
        </Link>
        <Link to="/onboarding/connection_getstarted">
          <div className=" text-[#fff] bg-[#1E073A]  p-4 rounded-[8px] w-full">
            <MakeConnectionIcon />
            <div className="font-semibold text-[18px] mt-4 mb-2 ">
              Make Connections
            </div>

            <p className="text-[12px] max-w-[90%]">
              Discover and engage with potential matches who share your values
              and interests.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        {/* <Button className="mb-4 w-full" type="default">
          <Link to="/book-session">Book A Session</Link>
        </Button> */}
        {/* <Button className="mb-4 w-full" type="default">
          <Link to="/community">Join A Community</Link>
        </Button>
        <Button className="mb-4 w-full" type="default">
          <Link to="/connections">Make Connections</Link>
        </Button> */}
      </div>
    </div>
  );
};

export default WhereNext;
