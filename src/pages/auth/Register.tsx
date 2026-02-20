import React, { useState } from "react";
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
import { toast } from "sonner";

interface RegistrationData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
}

const COUNTRY_CODES = [
  { code: "+234", label: "Nigeria (+234)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+233", label: "Ghana (+233)" },
  { code: "+27", label: "South Africa (+27)" },
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("+234");
  const [formData, setFormData] = useState<RegistrationData>({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim())
      newErrors.firstname = "First name is required";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Fill the fields below to create your Kinnect account."
    >
      <form
        className="flex h-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();

          if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
          }

          const normalizedPhone = formData.phone.replace(/\D/g, "");
          const payload: RegistrationData = {
            ...formData,
            phone: `${countryCode}${normalizedPhone}`,
          };

          // Store registration data in sessionStorage to pass to SetPassword page
          sessionStorage.setItem("registrationData", JSON.stringify(payload));
          navigate("/auth/set-password");
        }}
      >
        <div className="space-y-3 pr-2">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                First Name
              </Label>
              <Input
                name="firstname"
                placeholder="First name"
                value={formData.firstname}
                onChange={handleChange}
                className={`h-11 border-[#E4E4F0] text-[14px] ${
                  errors.firstname ? "border-red-500" : ""
                }`}
              />
              {errors.firstname && (
                <p className="text-xs text-red-500">{errors.firstname}</p>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                Last Name
              </Label>
              <Input
                name="lastname"
                placeholder="Last name"
                value={formData.lastname}
                onChange={handleChange}
                className={`h-11 border-[#E4E4F0] text-[14px] ${
                  errors.lastname ? "border-red-500" : ""
                }`}
              />
              {errors.lastname && (
                <p className="text-xs text-red-500">{errors.lastname}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Username
            </Label>
            <Input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={`h-11 border-[#E4E4F0] text-[14px] ${
                errors.username ? "border-red-500" : ""
              }`}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Email Address
            </Label>
            <Input
              name="email"
              type="email"
              placeholder="sampleemail@kinnect.com"
              value={formData.email}
              onChange={handleChange}
              className={`h-11 border-[#E4E4F0] text-[14px] ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="h-11 w-[170px] border-[#E4E4F0] bg-[#FAFAFF] text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="phone"
                placeholder="812 3456 790"
                value={formData.phone}
                onChange={handleChange}
                className={`h-11 flex-1 border-[#E4E4F0] text-[14px] ${
                  errors.phone ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger
                  className={`h-11 border-[#E4E4F0] text-[14px] ${
                    errors.gender ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender}</p>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-[500] text-[#1C1C1C]">
                Date of Birth
              </Label>
              <Input
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className={`h-11 border-[#E4E4F0] text-[14px] ${
                  errors.dob ? "border-red-500" : ""
                }`}
              />
              {errors.dob && (
                <p className="text-xs text-red-500">{errors.dob}</p>
              )}
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
          <Button type="submit">Create account</Button>

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
