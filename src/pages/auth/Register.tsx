import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthLayout } from "@/components/layout/AuthLayout";

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Create an account"
      description="Fill the fields below to create your Kinnect account."
    >
      <form
        className="flex h-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // call signup API then:
          navigate("/auth/register/verify");
        }}
      >
        <div className="space-y-3 pr-2">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                First Name
              </Label>
              <Input
                placeholder="First name"
                className="h-11 border-[#E4E4F0] text-[14px]"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                Last Name
              </Label>
              <Input
                placeholder="Last name"
                className="h-11 border-[#E4E4F0] text-[14px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Username
            </Label>
            <Input
              placeholder="Username"
              className="h-11 border-[#E4E4F0] text-[14px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="sampleemail@kinnect.com"
              className="h-11 border-[#E4E4F0] text-[14px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex h-11 items-center rounded-md border border-[#E4E4F0] bg-[#FAFAFF] px-3 text-[13px]"
              >
                <span className="mr-1">🇳🇬</span> +234
              </button>
              <Input
                placeholder="812 3456 790"
                className="h-11 flex-1 border-[#E4E4F0] text-[14px]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                Gender
              </Label>
              <Select>
                <SelectTrigger className="h-11 border-[#E4E4F0] text-[14px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                Date of Birth
              </Label>
              <Input
                type="date"
                className="h-11 border-[#E4E4F0] text-[14px]"
              />
            </div>
          </div>

          <p className="mt-1 text-[14px] leading-[20px] text-[#6C6C80]">
            By signing up, you agree to our{" "}
            <span className="text-[#7D1BCB]">Terms &amp; Conditions</span>. See
            how we use your data in our{" "}
            <span className="text-[#7D1BCB]">Privacy Policy</span>.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Button type="submit" >
            Create account
          </Button>

          <p className="text-center text-[13px] text-[#6C6C80]">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-[#7D1BCB]">
              Sign In
            </Link>
          </p>

          <div className="mt-2 border-t border-dashed border-[#E4E4F0] pt-4 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full border-[#E4E4F0] text-[14px]"
            >
              <span className="mr-2 text-lg">G</span>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full border-[#E4E4F0] text-[14px]"
            >
              <span className="mr-2 text-lg"></span>
              Continue with Apple
            </Button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
