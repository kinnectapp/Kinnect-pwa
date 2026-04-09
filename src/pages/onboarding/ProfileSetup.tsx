"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/api/auth";
import { handleApiError } from "@/api/serviceUtils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { dealBreakerQuestions, drinkOptions } from "@/lib/utils/constants";

const getOptions = (key: string): string[] =>
  dealBreakerQuestions
    .find((question) => question.key === key)
    ?.options.map((option) => option.item) ?? [];

const getOptionLabelByMainKey = (
  key: string,
  mainKeyValue: string | undefined,
): string => {
  if (!mainKeyValue) return "";
  const option = dealBreakerQuestions
    .find((question) => question.key === key)
    ?.options.find((item) => item.mainKey === mainKeyValue);
  return option?.item ?? "";
};

const getDrinkLabelByMainKey = (mainKeyValue: string | undefined): string => {
  if (!mainKeyValue) return "";
  return drinkOptions.find((item) => item.mainKey === mainKeyValue)?.item ?? "";
};


const mapSmokeRateValue = (value: string): string => {
  const option = value.trim().toLowerCase();
  if (option === "smoker" || option === "smoke") return "smoke";
  if (option === "smokes sometimes" || option === "smoke sometimes") {
    return "smokeSometimes";
  }
  if (option === "rarely smokes" || option === "rarely smoke") {
    return "rarelySmoke";
  }
  if (
    option === "doesn't smoke" ||
    option === "don't smoke" ||
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
  if (option === "drinker" || option === "drink") return "drink";
  if (option === "drinks sometimes" || option === "drink sometimes") {
    return "drinkSometimes";
  }
  if (option === "rarely drinks" || option === "rarely drink") {
    return "rarelyDrink";
  }
  if (
    option === "doesn't drink" ||
    option === "don't drink" ||
    option === "dont drink"
  ) {
    return "dontDrink";
  }
  if (option === "trying to quit" || option === "trying to quite") {
    return "tryingToQuit";
  }
  return value;
};

const PersonalDetails = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { useUpdateProfileMutation, useGetUserMutation } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();
  const { mutateAsync: getUserById } = useGetUserMutation();

  const [formData, setFormData] = useState({
    bio: String(user?.bio ?? ""),
    occupation: String(user?.occupation ?? ""),
    education: String(user?.education ?? ""),
    religion: String(user?.religion ?? ""),
    bodyType: String(user?.bodyType ?? ""),
    complexion: String(user?.complexion ?? ""),
    smoker: getOptionLabelByMainKey("smokingRate", user?.smokeRate as string),
    drinker: getDrinkLabelByMainKey(user?.drinkRate as string),
  });
  const [errors, setErrors] = useState({
    bio: "",
    education: "",
    religion: "",
    bodyType: "",
    complexion: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {
      bio: formData.bio.trim() ? "" : "bio should not be empty",
      education: formData.education ? "" : "education should not be empty",
      religion: formData.religion ? "" : "religion should not be empty",
      bodyType: formData.bodyType ? "" : "bodyType should not be empty",
      complexion: formData.complexion ? "" : "complexion should not be empty",
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await updateProfile({
        bio: formData.bio.trim(),
        occupation: formData.occupation.trim(),
        education: formData.education,
        religion: formData.religion,
        bodyType: formData.bodyType,
        complexion: formData.complexion,
        smokeRate: mapSmokeRateValue(formData.smoker),
        drinkRate: mapDrinkRateValue(formData.drinker),
      });

      if (user?.id) {
        const userResponse = await getUserById(String(user.id));
        const fetchedUser = userResponse?.data?.resp;
        if (fetchedUser && typeof fetchedUser === "object") {
          await setUser(fetchedUser as any);
        }
      }

      toast.success(response?.message || "Personal details updated.");
      navigate("/onboarding/location");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="gap-4 p-4 flex min-h-[100dvh] flex-col">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex mb-6 items-center gap-2"
        >
          <ChevronLeft /> Back
        </button>
        <h2 className="text-2xl text-[#55288D] font-semibold ">Personal Details</h2>
        <div className="flex gap-2 mt-3 mb-4 items-center justify-center">
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#85007033]"></div>
          <div className="flex-1 h-[2px] bg-[#85007033]"></div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 flex flex-col mb-4 justify-between gap-6 flex-1"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <label className="block text-[#77707F] text-xs font-light mb-2">
              Description about yourself that you would like people to know.
            </label>
            <textarea
              name="bio"
              className="h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none"
              value={formData.bio}
              onChange={(e) => handleSelectChange("bio", e.target.value)}
              placeholder="Write here"
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.bio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Occupation</label>
            <Input
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="h-[48px]"
              placeholder="Enter occupation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Education</label>
            <Select
              value={formData.education}
              onValueChange={(value) => handleSelectChange("education", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {getOptions("education").map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.education && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.education}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Religion</label>
            <Select
              value={formData.religion}
              onValueChange={(value) => handleSelectChange("religion", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                {getOptions("preferredReligion").map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.religion && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.religion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Body Type</label>
            <Select
              value={formData.bodyType}
              onValueChange={(value) => handleSelectChange("bodyType", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                {getOptions("bodyType").map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bodyType && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.bodyType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Complexion</label>
            <Select
              value={formData.complexion}
              onValueChange={(value) => handleSelectChange("complexion", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select complexion" />
              </SelectTrigger>
              <SelectContent>
                {getOptions("complexion").map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.complexion && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.complexion}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-[16px] text-[#77707F] font-semibold">
              Social Habits
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">Are you a smoker?</label>
              <Select
                value={formData.smoker}
                onValueChange={(value) => handleSelectChange("smoker", value)}
              >
                <SelectTrigger className="h-[48px]">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {getOptions("smokingRate").map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Are you a drinker?</label>
              <Select
                value={formData.drinker}
                onValueChange={(value) => handleSelectChange("drinker", value)}
              >
                <SelectTrigger className="h-[48px]">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {drinkOptions.map((option) => (
                    <SelectItem key={option.mainKey} value={option.item}>
                      {option.item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="mt-6 mb-10 w-full">
          {isPending ? "Saving..." : "Save & Continue"}
        </Button>
      </form>
    </div>
  );
};

export default PersonalDetails;
