"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, ImageIcon, Trash2 } from "lucide-react";
import useAuth from "@/api/auth";
import { handleApiError } from "@/api/serviceUtils";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

const ProfilePhoto = () => {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const {
    useFileUploadMutation,
    useUpdateProfileMutation,
    useGetUserMutation,
  } = useAuth();
  const { mutateAsync: uploadFile, isPending: isUploading } =
    useFileUploadMutation();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation();
  const { mutateAsync: getUserById } = useGetUserMutation();

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = selectedPhotos.length + newFiles.length;

    if (totalPhotos > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedPhotos((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedPhotos.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedPhotos) {
        let fileToUpload = file;
        try {
          // Compress the image before uploading
          const { compressImage } = await import("@/utils/imageCompression");
          const { formatBytes } = await import("@/utils/utils");
          fileToUpload = await compressImage(file);

          console.log(
            `[Image Upload] Original size: ${formatBytes(file.size)} | ` +
              `Compressed size: ${formatBytes(fileToUpload.size)}`,
          );
        } catch (error) {
          console.warn(
            "Image compression failed, falling back to original file",
            error,
          );
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        const response = await uploadFile(formData);
        const url = response?.data?.url;

        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length === 0) {
        toast.error("Image upload failed. Please try again.");
        return;
      }

      const profileResponse = await updateProfile({
        profilePhotos: uploadedUrls,
      });

      if (user?.id) {
        const userResponse = await getUserById(String(user.id));
        const fetchedUser = userResponse?.data?.resp;
        if (fetchedUser && typeof fetchedUser === "object") {
          await setUser(fetchedUser as any);
        }
      }

      toast.success(profileResponse?.message || "Profile photos updated.");
      navigate("/onboarding/profile-complete");
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white p-6 flex flex-col">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-900 mb-6 hover:opacity-70"
        >
          <ChevronLeft size={24} />
          <span className="text-lg font-medium">Back</span>
        </button>

        <h2 className="text-2xl text-[#55288D] font-semibold ">
          Profile Photo(s)
        </h2>

        <div className="flex gap-4 mt-3 mb-4 justify-center items-center">
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
          <div className="flex-1 h-[2px] bg-[#850070]"></div>
        </div>
      </div>

      <div className="bg-[#F3EEFA] p-4 mb-8 text-center">
        <p className="text-[#55288D] text-[12px] font-medium">
          You can upload a maximum of 5 photos
        </p>
      </div>

      {selectedPhotos.length === 0 ? (
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
            <p className="text-[#D400B3] underline text-xs">
              Click to add photo(s)
            </p>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 mb-8">
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

          <div className="flex gap-4 overflow-x-auto pb-2">
            {previews.map((preview, index) => (
              <div
                key={`${preview}-${index}`}
                className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-[#D3D0D8] cursor-pointer hover:border-[#D400B3] transition"
              >
                <img
                  src={preview || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

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

      <Button
        onClick={handleSubmit}
        disabled={selectedPhotos.length === 0 || isPending}
        className="w-full"
      >
        {isPending || isUploading ? "Uploading..." : "Submit"}
      </Button>
    </div>
  );
};

export default ProfilePhoto;
