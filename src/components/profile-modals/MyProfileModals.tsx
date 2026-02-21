import React from "react";
import { Check, ChevronLeft, Eye, EyeOff, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OtpInput } from "@/pages/auth/OtpInput";
import countryList from "@/data/countryList";
import { UpdateProfilePayload } from "@/lib/types/auth";
import {
  dealBreakerQuestions,
  drinkOptions,
  personalityQuestions,
} from "@/lib/utils/constants";

export type ProfileModalType =
  | "email"
  | "changePassword"
  | "phone"
  | "bio"
  | "occupation"
  | "education"
  | "religion"
  | "bodyType"
  | "complexion"
  | "smoking"
  | "drinking"
  | "location"
  | "interests"
  | "personality"
  | "dealbreakers"
  | "photos";

type ProfileValues = {
  email: string;
  phone: string;
  bio: string;
  occupation: string;
  education: string;
  religion: string;
  bodyType: string;
  complexion: string;
  smoking: string;
  drinking: string;
  location: string;
  city: string;
  state: string;
  country: string;
  address: string;
  interests: string[];
  personalitySummary: string;
  profilePhotos: string[];
  profilePhotosCount: number;
};

type Props = {
  activeModal: ProfileModalType | null;
  onClose: () => void;
  values: ProfileValues;
  onValueChange: (
    key: keyof ProfileValues,
    value: string | string[] | number,
  ) => void;
  onUpdateProfile: (
    payload: UpdateProfilePayload,
    localValues?: Partial<ProfileValues>,
  ) => Promise<boolean>;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onChangePassword: (payload: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<boolean>;
};

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
];

type CountryStateItem = { name: string; state_code: string };
type CountryItem = { name: string; iso3: string; states?: CountryStateItem[] };
const COUNTRY_LIST = countryList as CountryItem[];

const getDealBreakerOptions = (
  key: string,
  fallback: string[] = [],
): string[] =>
  dealBreakerQuestions.find((question) => question.key === key)?.options.map(
    (option) => option.item,
  ) ?? fallback;

const OPTION_MAP: Record<
  Exclude<
    ProfileModalType,
    | "email"
    | "changePassword"
    | "phone"
    | "bio"
    | "occupation"
    | "location"
    | "interests"
    | "personality"
    | "dealbreakers"
    | "photos"
  >,
  string[]
> = {
  education: getDealBreakerOptions("education", [
    "SSCE",
    "OND",
    "HND",
    "B.Sc.",
    "M.Sc.",
    "Ph.D",
  ]),
  religion: getDealBreakerOptions("preferredReligion", [
    "Catholic",
    "Protestant",
    "Pentecostal",
    "Islam",
    "Agnostic",
    "Others",
  ]),
  bodyType: getDealBreakerOptions("bodyType", [
    "Athletic",
    "Chubby",
    "Average Build",
    "Slim",
    "Small Stature",
  ]),
  complexion: getDealBreakerOptions("complexion", [
    "Dark Melanin",
    "Chocolate",
    "Fair Melanin",
    "Mixed race",
    "Asian",
    "Caucausian",
  ]),
  smoking: getDealBreakerOptions("smokingRate", [
    "Smoker",
    "Smokes Sometimes",
    "Rarely smokes",
    "Doesn't smoke",
    "Trying to quit",
  ]),
  drinking: drinkOptions.map((option) => option.item),
};

const LABEL_MAP: Record<ProfileModalType, string> = {
  email: "Email Address",
  changePassword: "Change Password",
  phone: "Phone Number",
  bio: "Bio",
  occupation: "Occupation",
  education: "Education",
  religion: "Religion",
  bodyType: "Body Type",
  complexion: "Complexion",
  smoking: "Smoking",
  drinking: "Drinking",
  location: "Location",
  interests: "Interests",
  personality: "Personality Test",
  dealbreakers: "Deal Breakers",
  photos: "Profile Photos",
};

const mapSmokeRateValue = (value: string): string => {
  const option = value.trim().toLowerCase();
  if (option === "smoke" || option === "smoker") return "smoke";
  if (option === "smoke sometimes" || option === "smokes sometimes") {
    return "smokeSometimes";
  }
  if (option === "rarely smokes" || option === "rarely smoke") {
    return "rarelySmoke";
  }
  if (
    option === "don't smoke" ||
    option === "doesn't smoke" ||
    option === "dont smoke"
  ) {
    return "dontSmoke";
  }
  if (option === "trying to quit" || option === "trying to quite") {
    return "tryingToQuit";
  }
  return value;
};

const mapDrinkRateValue = (value: string): string => {
  const option = value.trim().toLowerCase();
  if (option === "drink" || option === "drinker") return "drink";
  if (option === "drink sometimes" || option === "drinks sometimes") {
    return "drinkSometimes";
  }
  if (option === "rarely drinks" || option === "rarely drink") {
    return "rarelyDrink";
  }
  if (
    option === "don't drink" ||
    option === "doesn't drink" ||
    option === "dont drink"
  ) {
    return "dontDrink";
  }
  if (option === "trying to quit" || option === "trying to quite") {
    return "tryingToQuit";
  }
  return value;
};

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", ...props }) => (
  <button
    {...props}
    className={`h-12 w-full rounded-full bg-[#D400B3] px-4 text-[16px] font-semibold text-white disabled:opacity-60 ${className}`}
  />
);

const SecondaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", ...props }) => (
  <button
    {...props}
    className={`h-12 w-full rounded-full bg-[#55288D] px-4 text-[16px] font-semibold text-white disabled:opacity-60 ${className}`}
  />
);

const DrawerShell: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed  inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute min-h-[90dvh] inset-x-0 bottom-0 rounded-t-[18px] bg-[#F5F5F7] p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {children}
      </div>
    </div>
  );
};

const DrawerHeader: React.FC<{
  title?: string;
  onBack?: () => void;
}> = ({ title, onBack }) => (
  <div className="mb-6">
    <button
      type="button"
      onClick={onBack}
      className="mb-6 flex items-center gap-3 text-[16px] text-[#1C1C1C]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]">
        <ChevronLeft size={18} />
      </span>
      Back
    </button>
    {title && (
      <h3 className="text-[24px] font-semibold text-[#55288D]">{title}</h3>
    )}
  </div>
);

const EditableTextModal: React.FC<{
  title: string;
  value: string;
  onClose: () => void;
  onSubmit: (value: string) => Promise<boolean>;
  textarea?: boolean;
}> = ({ title, value, onClose, onSubmit, textarea = false }) => {
  const [step, setStep] = React.useState<"view" | "edit">("view");
  const [draft, setDraft] = React.useState(value);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <DrawerShell open onClose={onClose}>
      <DrawerHeader
        title={step === "view" ? title : `Edit ${title}`}
        onBack={step === "view" ? onClose : () => setStep("view")}
      />
      <p className="text-[14px] text-[#1C1C1C]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>

      {step === "view" ? (
        <div className="mt-5 rounded-[6px] border border-[#54278C1A] bg-white p-4 text-[16px] text-[#1C1C1C]">
          {value || "Not set"}
        </div>
      ) : textarea ? (
        <textarea
          className="mt-5 h-[140px] w-full rounded-[6px] border border-[#54278C1A] bg-white p-4 text-[16px] outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <input
          className="mt-5 h-12 w-full rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[16px] outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}

      <div className="mt-10">
        {step === "view" ? (
          <PrimaryButton onClick={() => setStep("edit")}>
            Edit {title}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              const ok = await onSubmit(draft.trim());
              setIsSubmitting(false);
              if (ok) {
                onClose();
              }
            }}
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </PrimaryButton>
        )}
      </div>
    </DrawerShell>
  );
};

const SelectOptionModal: React.FC<{
  title: string;
  currentValue: string;
  options: string[];
  onClose: () => void;
  onSubmit: (value: string) => Promise<boolean>;
}> = ({ title, currentValue, options, onClose, onSubmit }) => {
  const [openSelect, setOpenSelect] = React.useState(false);
  const [selected, setSelected] = React.useState(currentValue || options[0]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <DrawerShell open onClose={onClose}>
      <DrawerHeader title={title} onBack={onClose} />
      <p className="text-[14px] text-[#1C1C1C]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <div className="mt-5 rounded-[6px] border border-[#54278C1A] bg-white p-4 text-[16px] text-[#1C1C1C]">
        {currentValue || "Not set"}
      </div>
      <div className="mt-10">
        <PrimaryButton onClick={() => setOpenSelect(true)}>Edit</PrimaryButton>
      </div>

      {openSelect && (
        <div className="absolute inset-0 z-10 rounded-t-[18px] bg-black/30">
          <div className="absolute flex flex-col justify-between inset-x-0 bottom-0 rounded-t-[22px] h-[80dvh] bg-[#F5F5F7] p-4">
         <div className="">

             <div className="mb-2 flex items-center justify-between">
              <div className="w-2"></div>
              <h4 className="text-[24px] text-center font-semibold text-[#D400B3]">
                Select {title} Option
              </h4>
              <button type="button" onClick={() => setOpenSelect(false)}>
                <X size={24} />
              </button>
            </div>
            <p className="mb-4 mt-6 text-[14px] italic text-[#1C1C1C]">
              Choose an option below to update your {title.toLowerCase()}.
            </p>
            <div className="mb-3 rounded-[6px] border border-[#54278C1A] bg-white p-3 text-[14px]">
              Current Option:{" "}
              <span className="font-semibold">{currentValue || "Not set"}</span>
            </div>
            <div className="max-h-[50dvh]   rounded-[8px] bg-white">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected(option)}
                  className="flex w-full items-center gap-3 border-b border-[#EEEAF5] px-3 py-4 text-left text-[16px]"
                >
                  <span
                    className={`h-5 w-5 rounded-full border ${selected === option ? "border-[#55288D] ring-4 ring-[#55288D]/20" : "border-[#D8D8E0]"}`}
                  />
                  {option}
                </button>
              ))}
            </div>
         </div>
            <div className="mt-4">
              <PrimaryButton
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  const ok = await onSubmit(selected);
                  setIsSubmitting(false);
                  if (ok) {
                    onClose();
                  }
                }}
              >
                {isSubmitting ? "Saving..." : "Submit"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </DrawerShell>
  );
};

const EmailFlowModal: React.FC<{
  email: string;
  onClose: () => void;
  onEmailChange: (email: string) => void;
}> = ({ email, onClose, onEmailChange }) => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<"email" | "otp" | "success">("email");
  const [nextEmail, setNextEmail] = React.useState(email);
  const [otp, setOtp] = React.useState("");

  return (
    <DrawerShell open onClose={onClose}>
      {step === "email" && (
        <>
          <DrawerHeader title="Email Address" onBack={onClose} />
          <p className="text-[14px] text-[#1C1C1C]">
            Your registered email makes it easier for you to recover your
            account. Your current email address is stated below.
          </p>
          <input
            className="mt-5 h-12 w-full rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[16px] outline-none"
            value={nextEmail}
            onChange={(e) => setNextEmail(e.target.value)}
          />
          <p className="mt-3 text-[16px] font-semibold text-[#12A819]">
            Verified
          </p>
          <div className="mt-10">
            <PrimaryButton onClick={() => setStep("otp")}>Submit</PrimaryButton>
          </div>
        </>
      )}

      {step === "otp" && (
        <>
          <DrawerHeader title="Verify Your Email" onBack={() => setStep("email")} />
          <p className="text-[14px] text-[#1C1C1C]">
            A 6-digit code has been sent to{" "}
            <span className="font-semibold text-[#D400B3]">{nextEmail}</span>.
            Input the code below to proceed.
          </p>
          <OtpInput onChange={setOtp} />
          <div className="mt-6">
            <PrimaryButton
              disabled={otp.length !== 6}
              onClick={() => {
                onEmailChange(nextEmail);
                setStep("success");
              }}
            >
              Verify
            </PrimaryButton>
          </div>
          <p className="mt-6 text-center text-[14px] text-[#6C6C80]">
            Didn't get a code?{" "}
            <button
              type="button"
              className="font-semibold text-[#55288D] underline"
            >
              Resend Code
            </button>
          </p>
        </>
      )}

      {step === "success" && (
        <SuccessScreen
          title="Email Successfully Reset"
          subtitle="You have successfully changed your email address."
          onBackSettings={onClose}
          onDashboard={() => navigate("/app")}
        />
      )}
    </DrawerShell>
  );
};

const ChangePasswordFlowModal: React.FC<{
  onClose: () => void;
  onSubmit: (payload: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<boolean>;
}> = ({ onClose, onSubmit }) => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<"password" | "success">("password");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const passwordMismatch =
    confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;

  return (
    <DrawerShell open onClose={onClose}>
      {step === "password" && (
        <>
          <DrawerHeader title="Change Password" onBack={onClose} />
          <p className="text-[14px] text-[#1C1C1C]">
            Provide your current and new password below.
          </p>
          <PasswordField
            label="Current Password"
            show={showCurrent}
            onToggle={() => setShowCurrent((s) => !s)}
            placeholder="Enter current password"
            value={oldPassword}
            onChange={setOldPassword}
          />
          <PasswordField
            label="New Password"
            show={showNew}
            onToggle={() => setShowNew((s) => !s)}
            placeholder="Enter new password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm New Password"
            show={showConfirm}
            onToggle={() => setShowConfirm((s) => !s)}
            placeholder="Confirm new password"
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
          />
          {passwordMismatch && (
            <p className="mt-2 text-[12px] text-[#D92D20]">
              New password and confirm password do not match.
            </p>
          )}
          <div className="mt-10">
            <PrimaryButton
              disabled={
                isSubmitting ||
                !oldPassword.trim() ||
                !newPassword.trim() ||
                !confirmNewPassword.trim() ||
                passwordMismatch
              }
              onClick={async () => {
                setIsSubmitting(true);
                const ok = await onSubmit({
                  oldPassword: oldPassword.trim(),
                  newPassword: newPassword.trim(),
                  confirmNewPassword: confirmNewPassword.trim(),
                });
                setIsSubmitting(false);
                if (ok) {
                  setStep("success");
                }
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </PrimaryButton>
          </div>
        </>
      )}

      {step === "success" && (
        <SuccessScreen
          title="Password Changed Successfully"
          subtitle="You have successfully changed your password."
          onBackSettings={onClose}
          onDashboard={() => navigate("/app")}
        />
      )}
    </DrawerShell>
  );
};

const PhoneFlowModal: React.FC<{
  phone: string;
  onClose: () => void;
  onPhoneChange: (phone: string) => void;
}> = ({ phone, onClose, onPhoneChange }) => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<"phone" | "edit" | "otp" | "success">(
    "phone",
  );
  const [code, setCode] = React.useState("+234");
  const [number, setNumber] = React.useState(phone.replace("+234", "").trim());
  const [otp, setOtp] = React.useState("");

  return (
    <DrawerShell open onClose={onClose}>
      {step === "phone" && (
        <>
          <DrawerHeader title="Phone Number" onBack={onClose} />
          <p className="text-[14px] text-[#1C1C1C]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="mt-5 flex gap-3">
            <div className="h-12 w-[100px] rounded-[6px] border border-[#54278C1A] bg-white px-4 flex items-center text-[18px]">
              {code}
            </div>
            <div className="h-12 flex-1 rounded-[6px] border border-[#54278C1A] bg-white px-4 flex items-center text-[18px]">
              {number || "Not set"}
            </div>
          </div>
          <div className="mt-10">
            <PrimaryButton onClick={() => setStep("edit")}>
              Edit Phone Number
            </PrimaryButton>
          </div>
        </>
      )}

      {step === "edit" && (
        <>
          <DrawerHeader
            title="Edit Phone Number"
            onBack={() => setStep("phone")}
          />
          <p className="text-[14px] text-[#1C1C1C]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="mt-5 flex gap-3">
            <input
              className="h-12 w-[130px] rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[18px] outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              className="h-12 flex-1 rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[18px] outline-none"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="000 0000 000"
            />
          </div>
          <div className="mt-10">
            <PrimaryButton onClick={() => setStep("otp")}>Submit</PrimaryButton>
          </div>
        </>
      )}

      {step === "otp" && (
        <>
          <DrawerHeader
            title="Verify Your Email"
            onBack={() => setStep("edit")}
          />
          <p className="text-[14px] text-[#1C1C1C]">
            A 6-digit code has been sent to{" "}
            <span className="font-semibold text-[#D400B3]">
              example@kinnect.com
            </span>
            . Input the code below to proceed.
          </p>
          <OtpInput onChange={setOtp} />
          <div className="mt-6">
            <PrimaryButton
              disabled={otp.length !== 6}
              onClick={() => {
                onPhoneChange(`${code} ${number}`.trim());
                setStep("success");
              }}
            >
              Verify
            </PrimaryButton>
          </div>
          <p className="mt-6 text-center text-[14px] text-[#6C6C80]">
            Didn't get a code?{" "}
            <button
              type="button"
              className="font-semibold text-[#55288D] underline"
            >
              Resend Code
            </button>
          </p>
        </>
      )}

      {step === "success" && (
        <SuccessScreen
          title="Phone Number Changed"
          subtitle="You have successfully changed your phone number."
          onBackSettings={onClose}
          onDashboard={() => navigate("/app")}
        />
      )}
    </DrawerShell>
  );
};

const SuccessScreen: React.FC<{
  title: string;
  subtitle: string;
  onBackSettings: () => void;
  onDashboard: () => void;
}> = ({ title, subtitle, onBackSettings, onDashboard }) => (
  <div>
    <div className="mb-6  flex justify-center">
      <div className="flex mt-20 h-24 w-24 items-center justify-center rounded-full bg-[#55288D] text-white">
        <Check size={44} />
      </div>
    </div>
    <h4 className="text-center text-[24px] font-semibold text-[#1C1C1C]">
      {title}
    </h4>
    <p className="mt-3 text-center text-[16px] text-[#1C1C1C]">{subtitle}</p>
    <div className="mt-8 space-y-4">
      <PrimaryButton onClick={onBackSettings}>Back To Settings</PrimaryButton>
      <SecondaryButton onClick={onDashboard}>Go To Dashboard</SecondaryButton>
    </div>
  </div>
);

const PasswordField: React.FC<{
  label: string;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, show, onToggle, placeholder, value, onChange }) => (
  <div className="mt-4">
    <p className="mb-2 text-[16px] font-semibold text-[#1C1C1C]">{label}</p>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="h-12 w-full rounded-[6px] border border-[#54278C1A] bg-white px-4 pr-10 text-[16px] outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-3 flex items-center text-[#D400B3]"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const InterestsModal: React.FC<{
  selected: string[];
  onClose: () => void;
  onSubmit: (selected: string[]) => void;
}> = ({ selected, onClose, onSubmit }) => {
  const [step, setStep] = React.useState<"view" | "edit">("view");
  const [draft, setDraft] = React.useState<string[]>(selected);

  const toggle = (value: string) => {
    setDraft((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  return (
    <DrawerShell open onClose={onClose}>
      <DrawerHeader
        title={step === "view" ? "Interests" : "Update Your Interests"}
        onBack={step === "view" ? onClose : () => setStep("view")}
      />
      <p className="text-[14px] text-[#1C1C1C]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {(step === "view" ? selected : ALL_INTERESTS).map((interest) => {
          const active = draft.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => step === "edit" && toggle(interest)}
              className={`rounded-full border px-3 py-2 text-[14px] ${step === "edit" && active ? "border-transparent bg-[#D400B3] text-white" : "border-[#54278C26] bg-white text-[#77707F]"}`}
            >
              {interest}
            </button>
          );
        })}
      </div>
      <div className="mt-10">
        {step === "view" ? (
          <PrimaryButton onClick={() => setStep("edit")}>
            Update Interests
          </PrimaryButton>
        ) : (
          <SecondaryButton
            onClick={() => {
              onSubmit(draft);
              toast.success("Interests updated successfully.");
              onClose();
            }}
          >
            Submit
          </SecondaryButton>
        )}
      </div>
    </DrawerShell>
  );
};

const LocationModal: React.FC<{
  value: string;
  cityValue: string;
  stateValue: string;
  countryValue: string;
  addressValue: string;
  onClose: () => void;
  onSubmit: (payload: {
    city: string;
    state: string;
    country: string;
    address: string;
    locationText: string;
  }) => Promise<boolean>;
}> = ({
  value,
  cityValue,
  stateValue,
  countryValue,
  addressValue,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = React.useState<"view" | "edit">("view");
  const [city, setCity] = React.useState(cityValue || "");
  const [state, setState] = React.useState(stateValue || "");
  const [country, setCountry] = React.useState(countryValue || "");
  const [address, setAddress] = React.useState(addressValue || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const selectedCountry = React.useMemo(
    () => COUNTRY_LIST.find((item) => item.name === country),
    [country],
  );
  const stateOptions = selectedCountry?.states ?? [];

  React.useEffect(() => {
    if (!stateOptions.some((item) => item.name === state)) {
      setState("");
    }
  }, [stateOptions, state]);

  return (
    <DrawerShell open onClose={onClose}>
      <DrawerHeader
        title={step === "view" ? "Location" : "Update Location"}
        onBack={step === "view" ? onClose : () => setStep("view")}
      />
      {step === "view" ? (
        <>
          <p className="text-[14px] text-[#1C1C1C]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="mt-5 min-h-[150px] rounded-[6px] border border-[#54278C1A] bg-white p-4 text-[16px]">
            {value || "Not set"}
          </div>
          <div className="mt-10">
            <PrimaryButton onClick={() => setStep("edit")}>
              Edit Location
            </PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <p className="text-[14px] text-[#1C1C1C]">
            Fill the fields below to update your location.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-[16px] font-semibold">City</p>
              <input
                className="h-12 w-full rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[16px] outline-none"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <p className="mb-2 text-[16px] font-semibold">State</p>
              <select
                className="h-12 w-full rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[16px] outline-none"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={!country}
              >
                <option value="">Select state</option>
                {stateOptions.map((item) => (
                  <option key={item.state_code} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-2 text-[16px] font-semibold">Country</p>
              <select
                className="h-12 w-full rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[16px] outline-none"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select country</option>
                {COUNTRY_LIST.map((item) => (
                  <option key={item.iso3} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-2 text-[16px] font-semibold">Address</p>
              <input
                className="h-12 w-full rounded-[6px] border border-[#54278C1A] bg-white px-4 text-[16px] outline-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-10">
            <PrimaryButton
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                const locationText = [city, state, country]
                  .filter((item) => item && item.trim())
                  .join(", ");
                const ok = await onSubmit({
                  city: city.trim(),
                  state: state.trim(),
                  country: country.trim(),
                  address: address.trim(),
                  locationText,
                });
                setIsSubmitting(false);
                if (ok) {
                  onClose();
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </PrimaryButton>
          </div>
        </>
      )}
    </DrawerShell>
  );
};

const DealBreakersModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const categories = [
    ...dealBreakerQuestions.map((question) => ({
      name: question.question.replace(/^Your Preferred /, "").replace(/\?$/, ""),
      values: question.options.map(
        (option, index, list) => `${option.item} - ${list.length - index - 1}`,
      ),
    })),
    {
      name: "Drinking Habit",
      values: drinkOptions.map(
        (option, index, list) => `${option.item} - ${list.length - index - 1}`,
      ),
    },
  ];

  return (
    <DrawerShell open onClose={onClose}>
      <DrawerHeader title="Deal Breakers" onBack={onClose} />
      <p className="text-[14px] text-[#1C1C1C]">
        Review the traits you've marked as deal breakers to ensure your
        connections align with your preferences.
      </p>
      <div className="mt-4 max-h-[60vh] space-y-3 overflow-auto pr-1">
        {categories.map((section) => (
          <div
            key={section.name}
            className="rounded-[6px] border border-[#54278C1A] bg-white p-3"
          >
            <p className="mb-2 text-[16px] font-semibold text-[#1C1C1C]">
              {section.name}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[15px] text-[#77707F]">
              {section.values.map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <PrimaryButton
          onClick={() => {
            toast.success("Deal breakers reset successfully.");
            onClose();
          }}
        >
          Reset Deal Breakers
        </PrimaryButton>
      </div>
    </DrawerShell>
  );
};

const PersonalityModal: React.FC<{
  summary: string;
  onClose: () => void;
}> = ({ summary, onClose }) => {
  const navigate = useNavigate();

  return (
    <DrawerShell open onClose={onClose}>
      <DrawerHeader title="Personality Test" onBack={onClose} />
      <p className="text-[14px] text-[#1C1C1C]">
        View insights from your personality test to understand your traits and
        improve your match quality.
      </p>
      <p className="mt-2 text-[12px] text-[#77707F]">
        Based on {personalityQuestions.length} assessment questions.
      </p>
      <div className="mt-5 rounded-[6px] border border-[#54278C1A] bg-white p-4 text-[16px] leading-[1.45]">
        {summary || "No personality summary yet."}
      </div>
      <div className="mt-10">
        <PrimaryButton
          onClick={() => {
            onClose();
            navigate("/onboarding/personality_test");
          }}
        >
          Retake Test
        </PrimaryButton>
      </div>
    </DrawerShell>
  );
};

const PhotosModal: React.FC<{
  count: number;
  existingPhotos: string[];
  onClose: () => void;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onSubmit: (payload: { profilePhotos: string[] }) => Promise<boolean>;
}> = ({ count, existingPhotos, onClose, onUploadImages, onSubmit }) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSelect = (list: FileList | null) => {
    if (!list) return;
    const nextFiles = Array.from(list);
    const total = files.length + nextFiles.length;
    if (total > 5) {
      toast.error("You can upload maximum of 5 photos.");
      return;
    }
    const nextPreviews = nextFiles.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...nextFiles]);
    setPreviews((prev) => [...prev, ...nextPreviews]);
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    setPreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  React.useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <DrawerShell open onClose={onClose}>
      <DrawerHeader title="Profile Photos" onBack={onClose} />
      <p className="text-[14px] text-[#1C1C1C]">
        Manage your profile photos to improve profile visibility and match
        quality.
      </p>
      <div className="mt-5 rounded-[6px] border border-[#54278C1A] bg-white p-4 text-[16px]">
        {count > 0 ? `${count} Photos Uploaded` : "No Photos Uploaded"}
      </div>

      {existingPhotos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {existingPhotos.slice(0, 5).map((url) => (
            <img
              key={url}
              src={url}
              alt="profile"
              className="h-16 w-16 rounded-[8px] object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-4 rounded-[8px] border border-dashed border-[#D3D0D8] bg-white p-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleSelect(event.target.files)}
        />
        <button
          type="button"
          className="text-[14px] font-medium text-[#D400B3] underline"
          onClick={() => fileRef.current?.click()}
        >
          Click to add photo(s)
        </button>
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {previews.map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt={`preview-${index}`}
                  className="h-16 w-16 rounded-[8px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1C1C1C] text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <PrimaryButton
          disabled={files.length === 0 || isSaving}
          onClick={async () => {
            setIsSaving(true);
            const urls = await onUploadImages(files);
            if (!urls.length) {
              setIsSaving(false);
              return;
            }
            const mergedPhotos = [...existingPhotos, ...urls].slice(0, 5);
            const ok = await onSubmit({ profilePhotos: mergedPhotos });
            setIsSaving(false);
            if (ok) {
              onClose();
            }
          }}
        >
          {isSaving ? "Uploading..." : "Update Photos"}
        </PrimaryButton>
      </div>
    </DrawerShell>
  );
};

export const MyProfileModals: React.FC<Props> = ({
  activeModal,
  onClose,
  values,
  onValueChange,
  onUpdateProfile,
  onUploadImages,
  onChangePassword,
}) => {
  if (!activeModal) return null;

  if (activeModal === "email") {
    return (
      <EmailFlowModal
        email={values.email}
        onClose={onClose}
        onEmailChange={(value) => onValueChange("email", value)}
      />
    );
  }

  if (activeModal === "changePassword") {
    return (
      <ChangePasswordFlowModal onClose={onClose} onSubmit={onChangePassword} />
    );
  }

  if (activeModal === "phone") {
    return (
      <PhoneFlowModal
        phone={values.phone}
        onClose={onClose}
        onPhoneChange={(value) => onValueChange("phone", value)}
      />
    );
  }

  if (activeModal === "bio") {
    return (
      <EditableTextModal
        title="Bio"
        value={values.bio}
        onClose={onClose}
        onSubmit={(value) =>
          onUpdateProfile(
            { bio: value },
            {
              bio: value,
            },
          )
        }
        textarea
      />
    );
  }

  if (activeModal === "occupation") {
    return (
      <EditableTextModal
        title="Occupation"
        value={values.occupation}
        onClose={onClose}
        onSubmit={(value) =>
          onUpdateProfile(
            { occupation: value },
            {
              occupation: value,
            },
          )
        }
      />
    );
  }

  if (activeModal === "location") {
    return (
      <LocationModal
        value={values.location}
        cityValue={values.city}
        stateValue={values.state}
        countryValue={values.country}
        addressValue={values.address}
        onClose={onClose}
        onSubmit={(payload) =>
          onUpdateProfile(
            {
              city: payload.city,
              state: payload.state,
              country: payload.country,
              address: payload.address,
            },
            {
              city: payload.city,
              state: payload.state,
              country: payload.country,
              address: payload.address,
              location: payload.locationText,
            },
          )
        }
      />
    );
  }

  if (activeModal === "interests") {
    return (
      <InterestsModal
        selected={values.interests}
        onClose={onClose}
        onSubmit={(selected) => onValueChange("interests", selected)}
      />
    );
  }

  if (activeModal === "personality") {
    return (
      <PersonalityModal summary={values.personalitySummary} onClose={onClose} />
    );
  }

  if (activeModal === "dealbreakers") {
    return <DealBreakersModal onClose={onClose} />;
  }

  if (activeModal === "photos") {
    return (
      <PhotosModal
        count={values.profilePhotosCount}
        existingPhotos={values.profilePhotos}
        onClose={onClose}
        onUploadImages={onUploadImages}
        onSubmit={({ profilePhotos }) =>
          onUpdateProfile(
            { profilePhotos },
            {
              profilePhotos,
              profilePhotosCount: profilePhotos.length,
            },
          )
        }
      />
    );
  }

  return (
    <SelectOptionModal
      title={LABEL_MAP[activeModal]}
      currentValue={values[activeModal] as string}
      options={OPTION_MAP[activeModal]}
      onClose={onClose}
      onSubmit={(value) => {
        if (activeModal === "smoking") {
          return onUpdateProfile(
            { smokeRate: mapSmokeRateValue(value) },
            { smoking: value },
          );
        }

        if (activeModal === "drinking") {
          return onUpdateProfile(
            { drinkRate: mapDrinkRateValue(value) },
            { drinking: value },
          );
        }

        const payloadKeyMap: Partial<
          Record<
            ProfileModalType,
            "education" | "religion" | "bodyType" | "complexion"
          >
        > = {
          education: "education",
          religion: "religion",
          bodyType: "bodyType",
          complexion: "complexion",
        };

        const payloadKey = payloadKeyMap[activeModal];
        if (!payloadKey) {
          return Promise.resolve(false);
        }

        return onUpdateProfile(
          { [payloadKey]: value },
          { [activeModal]: value } as Partial<ProfileValues>,
        );
      }}
    />
  );
};
