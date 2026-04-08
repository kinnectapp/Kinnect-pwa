import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/api/auth";
import { handleApiError } from "@/api/serviceUtils";
import { useAuthStore } from "@/store/auth.store";
import {
  MyProfileModals,
  ProfileModalType,
} from "@/components/profile-modals/MyProfileModals";
import { UpdateProfilePayload } from "@/lib/types/auth";

const displayDate = (value?: string): string => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const displayText = (value?: string | null): string => {
  if (!value || !String(value).trim()) return "Not set";
  return String(value);
};

const editableText = (value?: string | null): string =>
  value && String(value).trim() ? String(value) : "";

type RowProps = {
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
};

const InfoRow: React.FC<RowProps> = ({ label, value, onClick }) => (
  <div className="mb-4">
    <p className="mb-2 text-[14px] font-medium text-[#77707F]">{label}</p>
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center justify-between rounded-[4px] border border-[#54278C1A] bg-white px-4 py-3 text-left disabled:cursor-default"
    >
      <span className="text-[16px] font-medium text-[#1C1C1C]">{value}</span>
      {onClick && <ChevronRight size={18} className="text-[#1C1C1C]" />}
    </button>
  </div>
);

const StatusPill: React.FC<{ complete: boolean }> = ({ complete }) => (
  <span
    className={`text-[14px] font-semibold ${complete ? "text-[#12A819]" : "text-[#F59E0B]"}`}
  >
    <span className="mr-1">{"\u2022"}</span>
    {complete ? "Completed" : "Pending"}
  </span>
);

const MyProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const {
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useFileUploadMutation,
    useGetUserMutation,
  } = useAuth();
  const { mutateAsync: updateProfile } = useUpdateProfileMutation();
  const { mutateAsync: changePassword } = useChangePasswordMutation();
  const { mutateAsync: uploadFile } = useFileUploadMutation();
  const { mutateAsync: getUserById } = useGetUserMutation();
  const [isIncognito, setIsIncognito] = React.useState(
    Boolean(user?.incognito),
  );
  const [activeModal, setActiveModal] = React.useState<ProfileModalType | null>(
    null,
  );

  const fullName =
    `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() ||
    user?.username ||
    "Not set";

  const initialLocation = [user?.city, user?.state, user?.country]
    .filter(Boolean)
    .join(", ");

  const profilePhotosCount = Array.isArray(user?.profilePhotos)
    ? user.profilePhotos.length
    : 0;

  const [profileValues, setProfileValues] = React.useState({
    email: displayText(user?.email),
    phone: displayText(user?.phone),
    bio: displayText(user?.bio as string),
    occupation: displayText(user?.occupation as string),
    education: displayText(user?.education as string),
    religion: displayText(user?.religion as string),
    bodyType: displayText(user?.bodyType as string),
    complexion: displayText(user?.complexion as string),
    smoking: displayText(user?.smokeRate as string),
    drinking: displayText(user?.drinkRate as string),
    location: displayText(initialLocation || null),
    city: editableText(user?.city as string),
    state: editableText(user?.state as string),
    country: editableText(user?.country as string),
    address: editableText(user?.address as string),
    interests: Array.isArray(user?.interests) ? user.interests : [],
    personalitySummary: displayText(user?.personalitySummary as string),
    profilePhotos: Array.isArray(user?.profilePhotos) ? user.profilePhotos : [],
    profilePhotosCount,
  });

  const interests = profileValues.interests;
  const hasDealBreaker = Boolean(user?.dealBreakerId);
  const hasPersonality = Boolean(
    user?.personalityCompleted || user?.personalityId,
  );

  React.useEffect(() => {
    const modal = searchParams.get("modal");
    if (modal === "changePassword") {
      setActiveModal("changePassword");
    }
  }, [searchParams]);

  const refreshUserFromApi = async () => {
    if (!user?.id) return;
    const response = await getUserById(String(user.id));
    const fetchedUser = response?.data?.resp;
    if (fetchedUser && typeof fetchedUser === "object") {
      await setUser(fetchedUser as any);
    }
  };

  const onUpdateProfile = async (
    payload: UpdateProfilePayload,
    localValues?: Partial<typeof profileValues>,
  ): Promise<boolean> => {
    try {
      const response = await updateProfile(payload);
      await refreshUserFromApi();

      if (localValues) {
        setProfileValues((prev) => ({ ...prev, ...localValues }));
      }

      toast.success(response?.message || "Profile updated successfully.");
      return true;
    } catch (error) {
      toast.error(handleApiError(error));
      return false;
    }
  };

  const onUploadImages = async (files: File[]): Promise<string[]> => {
    try {
      const urls: string[] = [];
      for (const file of files) {
        let fileToUpload = file;
        try {
          // Compress the image before uploading
          const { compressImage } = await import("@/utils/imageCompression");
          const { formatBytes } = await import("@/utils/utils");
          fileToUpload = await compressImage(file);
          
          console.log(
            `[Image Upload] Original size: ${formatBytes(file.size)} | ` +
            `Compressed size: ${formatBytes(fileToUpload.size)}`
          );
        } catch (error) {
          console.warn("Image compression failed, falling back to original file", error);
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);
        const response = await uploadFile(formData);
        const url = response?.data?.url;
        if (url) urls.push(url);
      }
      return urls;
    } catch (error) {
      toast.error(handleApiError(error));
      return [];
    }
  };

  const onChangePassword = async (payload: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<boolean> => {
    try {
      const response = await changePassword(payload);
      toast.success(response?.message || "Password changed successfully.");
      return true;
    } catch (error) {
      toast.error(handleApiError(error));
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-10">
      <div className=" sticky top-0  flex items-center gap-3 border-b  bg-[#fff] px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
        >
          <ChevronLeft size={18} className="text-[#5A2B8D]" />
        </button>
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#55288D]">
          My Profile
        </h1>
        <div className="w-9" />
      </div>
      <div className="px-4 py-6">
        <section>
          <h2 className="text-[20px] font-semibold leading-none text-[#1C1C1C]">
            Account
          </h2>
          <p className="mt-2 text-[14px] leading-[1.4] text-[#7B7683]">
            Manage your basic details and preferences for seamless app use.
          </p>

          <div className="mt-6">
            <InfoRow label="Full Name" value={fullName} />
            <InfoRow label="Username" value={displayText(user?.username)} />
            <InfoRow
              label="Email Address"
              value={profileValues.email}
              onClick={() => setActiveModal("email")}
            />
            <InfoRow
              label="Phone Number"
              value={profileValues.phone}
              onClick={() => setActiveModal("phone")}
            />

            <div className="rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[14px] text-[#7B7683]">Gender</p>
                  <p className="mt-1 text-[16px] font-medium text-[#1C1C1C]">
                    {displayText(user?.gender)}
                  </p>
                </div>
                <div>
                  <p className="text-[14px] text-[#7B7683]">Date of birth</p>
                  <p className="mt-1 text-[16px] font-medium text-[#1C1C1C]">
                    {displayDate(user?.dob)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="my-6 border-t border-dashed border-[#E8E2F0]" />

        <section>
          <h2 className="text-[20px] font-semibold leading-none text-[#1C1C1C]">
            Personal Details
          </h2>
          <p className="mt-2 text-[14px] leading-[1.4] text-[#7B7683]">
            Share a brief bio and key information to help others get to know you
            better.
          </p>

          <div className="mt-6">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[14px] font-medium text-[#7B7683]">Bio</p>
                <button
                  type="button"
                  onClick={() => setActiveModal("bio")}
                  className="text-[14px] font-medium text-[#D400B3] underline"
                >
                  Edit Bio
                </button>
              </div>
              <div className="rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-3">
                <p className="text-[16px] leading-[1.35] text-[#1C1C1C]">
                  {profileValues.bio}
                </p>
              </div>
            </div>

            <InfoRow
              label="Occupation"
              value={profileValues.occupation}
              onClick={() => setActiveModal("occupation")}
            />
            <InfoRow
              label="Education"
              value={profileValues.education}
              onClick={() => setActiveModal("education")}
            />
            <InfoRow
              label="Religion"
              value={profileValues.religion}
              onClick={() => setActiveModal("religion")}
            />
            <InfoRow
              label="Body Type"
              value={profileValues.bodyType}
              onClick={() => setActiveModal("bodyType")}
            />
            <InfoRow
              label="Complexion"
              value={profileValues.complexion}
              onClick={() => setActiveModal("complexion")}
            />
            <InfoRow
              label="Smoking Habit"
              value={profileValues.smoking}
              onClick={() => setActiveModal("smoking")}
            />
            <InfoRow
              label="Drinking Habit"
              value={profileValues.drinking}
              onClick={() => setActiveModal("drinking")}
            />
          </div>
        </section>

        <hr className="my-6 border-t border-dashed border-[#E8E2F0]" />

        <section>
          <div className="rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-medium text-[#1C1C1C]">
                Incognito Mode
              </span>
              <button
                type="button"
                onClick={async () => {
                  const nextIncognito = !isIncognito;
                  const ok = await onUpdateProfile(
                    { incognito: nextIncognito },
                    undefined,
                  );
                  if (ok) {
                    setIsIncognito(nextIncognito);
                  }
                }}
                className={`relative h-6 w-11 rounded-full transition ${isIncognito ? "bg-[#D400B3]" : "bg-[#E5E5EA]"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${isIncognito ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </div>
          </div>
          <p className="mt-2 text-[14px] text-[#7B7683]">
            Once on, everyone will be able to see your profile picture.
          </p>
        </section>

        <hr className="my-6 border-t border-dashed border-[#E8E2F0]" />

        <section>
          <h2 className="text-[20px] font-semibold leading-none text-[#1C1C1C]">
            Location
          </h2>
          <p className="mt-2 text-[14px] leading-[1.4] text-[#7B7683]">
            Specify your current area to enhance match accuracy and local
            connections.
          </p>
          <div className="mt-4 rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-3">
            <p className="text-[16px] text-[#1C1C1C]">
              {profileValues.location}
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setActiveModal("location")}
              className="h-12 w-full rounded-full bg-[#D400B3] px-4 text-[16px] font-semibold text-white"
            >
              Edit Location
            </button>
          </div>
        </section>

        <hr className="my-6 border-t border-dashed border-[#E8E2F0]" />

        <section>
          <p className="mb-3 text-[14px] font-medium text-[#7B7683]">
            Profile Photos
          </p>
          <button
            type="button"
            onClick={() => setActiveModal("photos")}
            className="flex w-full items-center justify-between rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-3 text-left"
          >
            <span className="text-[16px] font-medium text-[#1C1C1C]">
              {profileValues.profilePhotosCount > 0
                ? `${profileValues.profilePhotosCount} Photos Uploaded`
                : "No Photos Uploaded"}
            </span>
            <ChevronRight size={18} className="text-[#1C1C1C]" />
          </button>
        </section>

        <hr className="my-6 border-t border-dashed border-[#E8E2F0]" />

        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setActiveModal("dealbreakers")}
            className="flex w-full items-center justify-between rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-4 text-left"
          >
            <div>
              <p className="text-[14px] text-[#7B7683]">Deal breakers</p>
              <StatusPill complete={hasDealBreaker} />
            </div>
            <ChevronRight size={18} className="text-[#1C1C1C]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("interests")}
            className="w-full rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-4 text-left"
          >
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#7B7683]">Interests</p>
              <ChevronRight size={18} className="text-[#1C1C1C]" />
            </div>
            {interests.length === 0 ? (
              <StatusPill complete={false} />
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {interests.slice(0, 8).map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-[#E1DBEA] bg-[#F6F4FA] px-3 py-1 text-[12px] text-[#7B7683]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("personality")}
            className="flex w-full items-center justify-between rounded-[8px] border border-[#E5E1EB] bg-white px-4 py-4 text-left"
          >
            <div>
              <p className="text-[14px] text-[#7B7683]">Personality Test</p>
              <StatusPill complete={hasPersonality} />
            </div>
            <ChevronRight size={18} className="text-[#1C1C1C]" />
          </button>
        </section>
      </div>
      <MyProfileModals
        activeModal={activeModal}
        onClose={() => {
          setActiveModal(null);
          if (searchParams.has("modal")) {
            const next = new URLSearchParams(searchParams);
            next.delete("modal");
            setSearchParams(next, { replace: true });
          }
        }}
        values={profileValues}
        onValueChange={(key, value) =>
          setProfileValues((prev) => ({ ...prev, [key]: value }))
        }
        onUpdateProfile={onUpdateProfile}
        onUploadImages={onUploadImages}
        onChangePassword={onChangePassword}
      />
    </div>
  );
};

export default MyProfile;
