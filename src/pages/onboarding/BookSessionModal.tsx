import { ChevronLeft } from "lucide-react";
import sessionImg from "../../assets/images/session.svg";
import { ProfilesetupIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
const BookSessionModal = () => {
  const navigate = useNavigate();
  return (
    <div className="  gap-4 p-4 flex h-[100dvh] flex-col">
      <div onClick={()=>navigate(-1)} className="flex iitems-center gap-2">
        <ChevronLeft /> Back
      </div>
      <div className="flex-1   h-full">
        <img src={sessionImg} className="m-auto mt-10" alt="" />
        <h2 className="text-[24px] text-center mt-6 font-semibold text-[#55288D]">
          Book A Session
        </h2>
        <p className="text-[12px] text-[#1C1C1C] text-center mt-6">
          Book a Session with our resident coaches to receive personalized
          guidance and expert advice. Whether you need help navigating
          relationship challenges or enhancing your connection, our skilled
          coaches are here to support you on your journey toward deeper, more
          meaningful relationships.
        </p>
        <div className="m-auto   items-center flex-col gap-2 flex justify-center mt-6">
          <ProfilesetupIcon />
          <h3 className="text-[18px] font-medium text-[#1C1C1C]">
            Profile Setup
          </h3>
        </div>
 <Link to="/onboarding/book-session">
         <Button className="w-full mt-[50%]">Get Started</Button>

 </Link>
      </div>
    </div>
  );
};

export default BookSessionModal;
