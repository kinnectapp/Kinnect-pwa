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
import countryList from "@/data/countryList";

interface RegistrationData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
}

type CountryItem = {
  name: string;
  iso3: string;
};

const DIAL_CODES: Record<string, string> = {
  AFG: "+93",
  ALB: "+355",
  DZA: "+213",
  AND: "+376",
  AGO: "+244",
  ARG: "+54",
  ARM: "+374",
  AUS: "+61",
  AUT: "+43",
  AZE: "+994",
  BHR: "+973",
  BGD: "+880",
  BLR: "+375",
  BEL: "+32",
  BLZ: "+501",
  BEN: "+229",
  BTN: "+975",
  BOL: "+591",
  BIH: "+387",
  BWA: "+267",
  BRA: "+55",
  BRN: "+673",
  BGR: "+359",
  BFA: "+226",
  BDI: "+257",
  KHM: "+855",
  CMR: "+237",
  CAN: "+1",
  CPV: "+238",
  CAF: "+236",
  TCD: "+235",
  CHL: "+56",
  CHN: "+86",
  COL: "+57",
  COM: "+269",
  COG: "+242",
  COD: "+243",
  CRI: "+506",
  CIV: "+225",
  HRV: "+385",
  CUB: "+53",
  CYP: "+357",
  CZE: "+420",
  DNK: "+45",
  DJI: "+253",
  DOM: "+1",
  ECU: "+593",
  EGY: "+20",
  SLV: "+503",
  GNQ: "+240",
  ERI: "+291",
  EST: "+372",
  SWZ: "+268",
  ETH: "+251",
  FIN: "+358",
  FRA: "+33",
  GAB: "+241",
  GMB: "+220",
  GEO: "+995",
  DEU: "+49",
  GHA: "+233",
  GRC: "+30",
  GTM: "+502",
  GIN: "+224",
  GNB: "+245",
  GUY: "+592",
  HTI: "+509",
  HND: "+504",
  HUN: "+36",
  ISL: "+354",
  IND: "+91",
  IDN: "+62",
  IRN: "+98",
  IRQ: "+964",
  IRL: "+353",
  ISR: "+972",
  ITA: "+39",
  JAM: "+1",
  JPN: "+81",
  JOR: "+962",
  KAZ: "+7",
  KEN: "+254",
  KWT: "+965",
  KGZ: "+996",
  LAO: "+856",
  LVA: "+371",
  LBN: "+961",
  LSO: "+266",
  LBR: "+231",
  LBY: "+218",
  LIE: "+423",
  LTU: "+370",
  LUX: "+352",
  MDG: "+261",
  MWI: "+265",
  MYS: "+60",
  MDV: "+960",
  MLI: "+223",
  MLT: "+356",
  MRT: "+222",
  MUS: "+230",
  MEX: "+52",
  MDA: "+373",
  MNG: "+976",
  MNE: "+382",
  MAR: "+212",
  MOZ: "+258",
  MMR: "+95",
  NAM: "+264",
  NPL: "+977",
  NLD: "+31",
  NZL: "+64",
  NIC: "+505",
  NER: "+227",
  NGA: "+234",
  MKD: "+389",
  NOR: "+47",
  OMN: "+968",
  PAK: "+92",
  PAN: "+507",
  PNG: "+675",
  PRY: "+595",
  PER: "+51",
  PHL: "+63",
  POL: "+48",
  PRT: "+351",
  QAT: "+974",
  ROU: "+40",
  RUS: "+7",
  RWA: "+250",
  SAU: "+966",
  SEN: "+221",
  SRB: "+381",
  SLE: "+232",
  SGP: "+65",
  SVK: "+421",
  SVN: "+386",
  SOM: "+252",
  ZAF: "+27",
  KOR: "+82",
  SSD: "+211",
  ESP: "+34",
  LKA: "+94",
  SDN: "+249",
  SUR: "+597",
  SWE: "+46",
  CHE: "+41",
  SYR: "+963",
  TWN: "+886",
  TJK: "+992",
  TZA: "+255",
  THA: "+66",
  TGO: "+228",
  TTO: "+1",
  TUN: "+216",
  TUR: "+90",
  TKM: "+993",
  UGA: "+256",
  UKR: "+380",
  ARE: "+971",
  GBR: "+44",
  USA: "+1",
  URY: "+598",
  UZB: "+998",
  VEN: "+58",
  VNM: "+84",
  YEM: "+967",
  ZMB: "+260",
  ZWE: "+263",
};

const iso3ToIso2 = (iso3: string): string => {
  if (!iso3 || iso3.length < 2) return "";
  if (iso3 === "GBR") return "GB";
  if (iso3 === "USA") return "US";
  return iso3.slice(0, 2);
};

const iso2ToFlag = (iso2: string): string => {
  if (!iso2 || iso2.length !== 2) return "🏳";
  return iso2
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
};

const COUNTRIES = (countryList as CountryItem[])
  .filter((country) => DIAL_CODES[country.iso3])
  .map((country) => {
    const dialCode = DIAL_CODES[country.iso3];
    const iso2 = iso3ToIso2(country.iso3);
    const flag = iso2ToFlag(iso2);
    return {
      iso3: country.iso3,
      name: country.name,
      dialCode,
      flag,
      optionLabel: `${country.name} (${dialCode})`,
      selectedLabel: `${flag} (${dialCode})`,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const Register: React.FC = () => {
  const navigate = useNavigate();
  const defaultCountry = COUNTRIES.find((country) => country.iso3 === "NGA");
  const [selectedCountryIso3, setSelectedCountryIso3] = useState(
    defaultCountry?.iso3 || "NGA",
  );
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
          const selectedCountry =
            COUNTRIES.find((item) => item.iso3 === selectedCountryIso3) ||
            defaultCountry;
          const countryCode = selectedCountry?.dialCode || "+234";
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
              <Select
                value={selectedCountryIso3}
                onValueChange={setSelectedCountryIso3}
              >
                <SelectTrigger className="h-11 w-fit border-[#E4E4F0] bg-[#FAFAFF] text-[13px]">
                  <SelectValue>
                    {COUNTRIES.find((item) => item.iso3 === selectedCountryIso3)
                      ?.selectedLabel || "🏳 (+234)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((item) => (
                    <SelectItem key={item.iso3} value={item.iso3}>
                      {item.optionLabel}
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
