/**
 * Complete Profile Component Example
 * Shows how to complete user profile after registration
 */

import React, { useState } from "react";
import { useAuth } from "@/api/auth";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";

const CompleteProfileExample: React.FC = () => {
  const { useCompleteProfileMutation, useFileUploadMutation } = useAuth();
  const { mutate: completeProfile, isPending } = useCompleteProfileMutation();
  const { mutateAsync: uploadFile, isPending: isUploading } =
    useFileUploadMutation();

  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    interests: [] as string[],
    avatar: null as File | null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let avatarUrl = "";

      // Upload avatar if provided
      if (formData.avatar) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.avatar);

        const uploadResponse = await uploadFile(formDataUpload);
        avatarUrl = uploadResponse.data.url;
      }

      // Complete profile
      completeProfile(
        {
          bio: formData.bio,
          location: formData.location,
          interests: formData.interests,
          ...(avatarUrl && { avatar: avatarUrl }),
        },
        {
          onSuccess: async () => {
            // Update user in store
            // Profile completed successfully

            toast.success("Profile completed successfully!");
          },
          onError: (error: any) => {
            const errorMessage = handleApiError(error);
            toast.error(errorMessage);
          },
        },
      );
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const interestOptions = [
    "Reading",
    "Sports",
    "Travel",
    "Music",
    "Art",
    "Cooking",
    "Gaming",
    "Fitness",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Complete Your Profile</h2>

      {/* Avatar Upload */}
      <div>
        <label htmlFor="avatar" className="block font-medium mb-2">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block font-medium mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          rows={4}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block font-medium mb-2">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Interests */}
      <div>
        <label className="block font-medium mb-2">Interests</label>
        <div className="grid grid-cols-2 gap-2">
          {interestOptions.map((interest) => (
            <label key={interest} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="rounded"
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || isUploading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isPending || isUploading ? "Saving..." : "Complete Profile"}
      </button>
    </form>
  );
};

export default CompleteProfileExample;
