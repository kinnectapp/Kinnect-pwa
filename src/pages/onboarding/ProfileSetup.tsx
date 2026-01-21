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
import { Link } from "react-router-dom";

const PersonalDetails = () => {
  const [formData, setFormData] = useState({
    bio: "",
    occupation: "",
    education: "",
    religion: "",
    bodyType: "",
    complexion: "",
    smoker: "",
    drinker: "",
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

  return (
    <div className="  gap-4 p-4 flex min-h-[100dvh] flex-col">
      <div className="">
        <div className="flex mb-6 iitems-center gap-2">
          <ChevronLeft /> Back
        </div>
        <h2 className="text-2xl text-[#55288D] font-semibold ">
          Personal Details
        </h2>
        <div className="flex gap-2 mt-3 mb-4 items-center justify-center">
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#85007033]"></div>
          <div className="flex-1 h-[2px] bg-[#85007033]"></div>
        </div>
      </div>

      <form className="space-y-4 flex flex-col mb-4 justify-between gap-6 flex-1">
        <div className=" flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <label className="block text-[#77707F] text-xs font-light mb-2">
              Description about yourself that you’d like people to know.
            </label>
            <Input
              name="bio"
              className="h-[100px] font-medium"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Write here"
            />
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
                <SelectItem value="highschool">High School</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="university">University</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="christian">Christian</SelectItem>
                <SelectItem value="muslim">Muslim</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Body Type
            </label>
            <Select
              value={formData.bodyType}
              onValueChange={(value) => handleSelectChange("bodyType", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slim">Slim</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="athletic">Athletic</SelectItem>
                <SelectItem value="curvy">Curvy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Complexion
            </label>
            <Select
              value={formData.complexion}
              onValueChange={(value) => handleSelectChange("complexion", value)}
            >
              <SelectTrigger className="h-[48px]">
                <SelectValue placeholder="Select complexion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="block text-[16px] text-[#77707F] font-semibold">
              Social Habits
            </label>
            <div>
              <label className="block text-sm font-medium mb-2">
                Are you a smoker?
              </label>
              <Select
                value={formData.smoker}
                onValueChange={(value) => handleSelectChange("smoker", value)}
              >
                <SelectTrigger className="h-[48px]">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Are you a drinker?
              </label>
              <Select
                value={formData.drinker}
                onValueChange={(value) => handleSelectChange("drinker", value)}
              >
                <SelectTrigger className="h-[48px]">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button className="mt-6 mb-10 w-full" asChild>
          <Link to="/onboarding/location">Save & Continue</Link>
        </Button>
      </form>
    </div>
  );
};

export default PersonalDetails;
