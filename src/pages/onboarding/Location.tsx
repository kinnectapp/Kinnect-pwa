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

const Location = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    country: "",
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
  };

  const handleContinue = () => {
    navigate("/onboarding/profile-photo");
  };

  return (
    <div className="  gap-4 p-4 flex min-h-[100dvh] flex-col">
      <div className="">
        <div className="flex mb-6 iitems-center gap-2">
          <ChevronLeft /> Back
        </div>
        <h2 className="text-2xl text-[#55288D] font-semibold ">Location</h2>
        <div className="flex gap-2 mt-3 mb-4 items-center justify-center">
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#85007033]"></div>
        </div>
      </div>

      <form
        className="space-y-4 flex flex-col mb-4 justify-between gap-6 flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
      >
        <div className=" flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter city"
              className="h-[48px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleSelectChange("state", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="state1">State 1</SelectItem>
                <SelectItem value="state2">State 2</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="country1">Country 1</SelectItem>
                <SelectItem value="country2">Country 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleContinue} className="mt-6 w-full">
          Save & Continue
        </Button>
      </form>
    </div>
  );
};

export default Location;
