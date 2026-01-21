"use client";

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X, Plus, ImageIcon, Trash2 } from "lucide-react";

const ProfilePhoto = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = selectedPhotos.length + newFiles.length;

    if (totalPhotos > 5) {
      alert("Maximum 5 photos allowed");
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedPhotos([...selectedPhotos, ...newFiles]);
    setPreviews([...previews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedPhotos.length === 0) {
      alert("Please select at least one photo");
      return;
    }
    navigate("/onboarding/profile-complete");
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-900 mb-6 hover:opacity-70"
        >
          <ChevronLeft size={24} />
          <span className="text-lg font-medium">Back</span>
        </button>

        <h2 className="text-2xl text-[#55288D] font-semibold ">
          {" "}
          Profile Photo(s)
        </h2>

        {/* Decorative lines */}
        <div className="flex gap-4 mt-3 mb-4  justify-center items-center">
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-[#F3EEFA]   p-4 mb-8 text-center">
        <p className="text-[#55288D] text-[12px] font-medium">
          You can upload a maximum of 5 photos
        </p>
      </div>

      {/* Main content area */}
      {selectedPhotos.length === 0 ? (
        // Empty state
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-80 border-2 border-dashed border-[#D3D0D8] rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-[#F9F7FB] transition"
          >
            <div className="w-16 h-16 bg-[#E8E3F0] rounded-full flex items-center justify-center">
              <ImageIcon size={32} className="text-[#55288D]" />
            </div>
            <p className="text-[#D400B3]  underline text-xs">
              Click to add photo(s)
            </p>
          </button>
        </div>
      ) : (
        // Filled state
        <div className="flex-1 flex flex-col gap-6 mb-8">
          {/* Main photo preview */}
          <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={previews[0] || "/placeholder.svg"}
              alt="Main preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removePhoto(0)}
              className="absolute top-4 right-4 bg-[#D400B3] rounded-full p-3 text-white hover:bg-[#B8009E] transition"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Thumbnails row */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-[#D3D0D8] cursor-pointer hover:border-[#D400B3] transition"
              >
                <img
                  src={preview || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Add more photos button */}
            {selectedPhotos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-[#D3D0D8] flex flex-col items-center justify-center gap-2 hover:bg-[#F9F7FB] transition"
              >
                <Plus size={24} className="text-[#55288D]" />
                <span className="text-[#55288D] font-semibold text-sm">
                  Add
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={selectedPhotos.length === 0}
        className="w-full "
      >
        Submit
      </Button>
    </div>
  );
};

export default ProfilePhoto;
