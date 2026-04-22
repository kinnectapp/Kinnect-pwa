"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import countryList from "@/data/countryList";
import useAuth from "@/api/auth";
import { handleApiError } from "@/api/serviceUtils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

type CountryStateItem = { name: string; state_code: string };
type CountryItem = { name: string; iso3: string; states?: CountryStateItem[] };
const COUNTRY_LIST = countryList as CountryItem[];

const Location = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { useUpdateProfileMutation, useGetUserMutation } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();
  const { mutateAsync: getUserById } = useGetUserMutation();

  const [formData, setFormData] = useState({
    city: String(user?.city ?? ""),
    state: String(user?.state ?? ""),
    country: String(user?.country ?? ""),
    address: String(user?.address ?? ""),
  });
  const [errors, setErrors] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
  });

  const selectedCountry = COUNTRY_LIST.find(
    (item) => item.name === formData.country,
  );
  const stateOptions = selectedCountry?.states ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  React.useEffect(() => {
    if (
      formData.state &&
      !stateOptions.some((item) => item.name === formData.state)
    ) {
      setFormData((prev) => ({ ...prev, state: "" }));
    }
  }, [formData.country, formData.state, stateOptions]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      address: formData.address.trim() ? "" : "address should not be empty",
      city: formData.city.trim() ? "" : "city should not be empty",
      state: formData.state ? "" : "state should not be empty",
      country: formData.country ? "" : "country should not be empty",
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some((value) => value)) {
      return;
    }

    try {
      const response = await updateProfile({
        city: formData.city.trim(),
        state: formData.state,
        country: formData.country,
        address: formData.address.trim(),
      });

      if (user?.id) {
        const userResponse = await getUserById(String(user.id));
        const fetchedUser = userResponse?.data?.resp;
        if (fetchedUser && typeof fetchedUser === "object") {
          await setUser(fetchedUser as any);
        }
      }

      toast.success(response?.message || "Location updated.");
      navigate("/onboarding/profile-photo");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex mb-6 items-center gap-2"
        >
          <ChevronLeft /> Back
        </button>
        <h2 className="text-2xl text-[#55288D] font-semibold ">Location</h2>
        <div className="flex gap-2 mt-3 mb-4 items-center justify-center">
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#85007033]"></div>
        </div>
      </div>

      <form
        className="space-y-4 flex flex-col mb-4 justify-between gap-6 flex-1"
        onSubmit={handleContinue}
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter city"
              className="h-[48px]"
            />
            {errors.city && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_LIST.map((item) => (
                  <SelectItem key={item.iso3} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.country}</p>
            )}
          </div>

          {formData.country && (
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleSelectChange("state", value)}
                disabled={!formData.country}
              >
                <SelectTrigger className="h-[48px]">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((item) => (
                    <SelectItem key={item.state_code} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="mt-1 text-xs text-[#D92D20]">{errors.state}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address"
              className="h-[48px]"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-[#D92D20]">{errors.address}</p>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="mt-6 w-full">
          {isPending ? "Saving..." : "Save & Continue"}
        </Button>
      </form>
    </div>
  );
};

export default Location;
