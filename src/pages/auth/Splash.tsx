// src/pages/auth/Splash.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Splash2Img from "../../assets/images/splash2.png";
import { Button } from "@/components/ui/button";
import Logo from "../../assets/images/logo.svg";
import PatternBg from "../../assets/images/pattern.svg";
import Kinnect from "../../assets/images/kinnect.svg";
import Personaldev from "../../assets/images/personaldev.jpg";
import GalleryImgs from "../../assets/images/gallery.svg";
import Step4Img from "../../assets/images/stepfour.jpg";
type ScreenIndex = 0 | 1 | 2 | 3 | 4;

const Splash: React.FC = () => {
  const [screen, setScreen] = React.useState<ScreenIndex>(0);
  const navigate = useNavigate();

  const goNext = () => {
    setScreen((prev) => (prev < 4 ? ((prev + 1) as ScreenIndex) : prev));
  };

  const skipToEnd = () => {
    setScreen(4);
  };

  const goToSignup = () => {
    // change to your signup route
    navigate("/auth/register");
  };

  const goToLogin = () => {
    // change to your login route
    navigate("/auth/login");
  };

  useEffect(() => {
    const t = setTimeout(() => {
      goNext();
    }, 3000);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-white">
      {screen === 0 && (
        <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#150024] px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <div className="flex flex-col items-center gap-4">
            {/* logo mark */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#150024]">
              {/* your heart/kinnect icon here */}
              <img src={Logo} alt="Kinnect logo" className="h-24 w-1242" />
            </div>
            <span className="text-xl font-semibold italic text-white">
              <img src={Kinnect} alt="" />
            </span>
          </div>
        </div>
      )}

      {screen === 1 && (
        <div
          className="relative flex min-h-[100dvh] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${Splash2Img})` }}
        >
          <div className="absolute inset-0 " />

          <div className="absolute inset-0 bg-gradient-to-t from-[#00000088]  via-[#20f21500] to-[#fff0]" />

          <div className="relative mt-auto flex w-full flex-col items-center justify-center px-6 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
            <p className="mb-1 text-[32px] font-semibold leading-tight text-white">
              Kinnect - Where new
            </p>
            <p className="mb-1 text-[32px] font-semibold leading-tight text-white">
              and renewed
            </p>
            <p className="mb-6 text-[32px] font-semibold leading-tight text-white">
              connections begin.
            </p>

            <Button onClick={goNext} className="w-full max-w-[500px]">
              Get Started
            </Button>
          </div>
        </div>
      )}

      {screen === 2 && (
        <div className="flex min-h-[100dvh] w-full flex-col bg-cover bg-center pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div
            style={{
              backgroundImage: `url(${Personaldev})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="flex-[2]"
          ></div>

          <div
            style={{ backgroundImage: `url(${PatternBg})` }}
            className="flex-[1]  mt-auto w-full p-4 py-8 "
          >
            <p className="text-[32px] font-semibold text-center mb-4 leading-tight text-gray-900">
              Start your personal development journey.
            </p>

            <p className="mt-3 text-[14px] leading-[20px] text-center text-gray-600">
              Kinnect is designed to help you upgrade to a better version of you
              through our Personality Test, and our pre and post match coaching.
            </p>

            {/* progress dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="h-[2px] w-10 rounded-full bg-[#850070]" />
              <span className="h-[2px] w-10 rounded-full bg-[#85007033]" />
            </div>

            <div className="mt-8 gap-4 flex items-center justify-between">
              <Button variant={"ghost"} className="flex-1" onClick={skipToEnd}>
                Skip
              </Button>
              <Button className="flex-1" onClick={goNext}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {screen === 3 && (
        <div
          style={{ backgroundImage: `url(${PatternBg})` }}
          className="flex min-h-[100dvh] w-full flex-col bg-cover bg-center pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)]"
        >
          <div className="flex-[2] h-[60%]">
            <img className=" w-full h-full" src={GalleryImgs} alt="" />
          </div>

          <div className="flex-[1]  mt-auto w-full p-4 py-8 ">
            <img
              src={Logo}
              className="
            w-12 h-12 m-auto mb-4"
              alt=""
            />
            <p className="text-[32px] font-semibold text-center mb-4 leading-tight text-gray-900">
              Join the Community{" "}
            </p>

            <p className="mt-3 text-[14px] leading-[20px] text-center text-gray-600">
              Join a tribe of kindred spirits where conversations about
              relationships blossom, friendships grow, and support is always
              just a message away.{" "}
            </p>

            {/* progress dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="h-[2px] w-10 rounded-full bg-[#85007033]" />{" "}
              <span className="h-[2px] w-10 rounded-full bg-[#850070]" />
            </div>

            <div className="mt-8 gap-4 flex items-center justify-between">
              <Button variant={"ghost"} className="flex-1" onClick={skipToEnd}>
                Skip
              </Button>
              <Button className="flex-1" onClick={goNext}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {screen === 4 && (
        <div
          className="relative flex min-h-[100dvh] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${Step4Img})` }}
        >
          <div className="absolute inset-0 " />

          <div className="absolute inset-0 bg-gradient-to-t from-[#000000af]  via-[#20f21500] to-[#fff0]" />

          <div className="relative mt-auto flex w-full flex-col items-center justify-center gap-4 px-6 pb-[calc(env(safe-area-inset-bottom)+4rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
            <img
              src={Logo}
              className="
            w-12 h-12 m-auto mb-4"
              alt=""
            />
            <p className="text-[32px] font-semibold text-center leading-tight text-white">
              Coached Connections
            </p>

            <p className="text-[18px] mb-4 leading-[20px] text-center text-white">
              Explore with Kinnect
            </p>

            <Button onClick={goToSignup} className="w-full mb-3 max-w-[500px]">
              Create an account
            </Button>
            <Button
              variant={"secondary"}
              onClick={goToLogin}
              className="w-full max-w-[500px]"
            >
              Login to your account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Splash;
