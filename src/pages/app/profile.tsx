import React from "react";
import { ChevronRight, Star, ChevronLeft, Minus, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/api/auth";
import { handleApiError } from "@/api/serviceUtils";
import { useAuthStore } from "@/store/auth.store";
import ProfileIconImg from "../../assets/images/profileIcon.png"
import {
  BookCoachingIcon,
  DeleteIcon,
  FaqIcon,
  HelpIcon,
  LogoutIcon,
  NotificationIcon,
  PasswordIcon,
  PrivacyIcon,
  ProfiileIcon,
  RatingIcon,
  SubscriptionIcon,
  SuccessIcon,
  TermsIcon,
} from "@/components/icons";
import UserImage from "../../assets/images/user-profile.png";
import confettiImage from "@/assets/images/confetti.svg";
import { Logo } from "@/components/layout/logo";

const RatingReviewModal: React.FC<{
  open: boolean;
  initialRating: number;
  initialReview: string;
  onClose: () => void;
  onSubmit: (payload: { rating: number; review: string }) => Promise<boolean>;
}> = ({ open, initialRating, initialReview, onClose, onSubmit }) => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<"form" | "success">("form");
  const [rating, setRating] = React.useState(initialRating || 0);
  const [review, setReview] = React.useState(initialReview || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setStep("form");
      setRating(initialRating || 0);
      setReview(initialReview || "");
      setIsSubmitting(false);
    }
  }, [open, initialRating, initialReview]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 min-h-[86dvh] rounded-t-[18px] bg-[#fff] p-4">
        {step === "form" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
              >
                <ChevronLeft size={16} className="text-[#1C1C1C]" />
              </button>
              <h2 className="text-[18px] font-semibold text-[#55288D]">
                Ratings & Reviews
              </h2>
              <div className="w-9" />
            </div>

            <div className="mb-6  mt-16 rounded-[8px] border border-[#DECFEA] bg-[#FAF8FB] p-4 text-center">
              <p className="mb-3 text-[16px] text-[#77707F]">
                Rate The Kinnect App
              </p>
              <div className="flexitems-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = value <= rating;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="transition"
                    >
                      <Star
                        strokeWidth={1}
                        size={36}
                        className={
                          active
                            ? "fill-[#D400B3]  text-[#D400B3]"
                            : "text-[#8E8B97]"
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-dashed border-[#E1D8EB] pt-6">
              <p className="mb-3 text-[14px] font-medium text-[#1C1C1C]">
                Write A Review
              </p>
              <textarea
                className="h-[210px] w-full rounded-[8px] border border-[#DECFEA] bg-[#FAF8FB] p-4 text-[16px] text-[#1C1C1C] outline-none"
                placeholder="Write here"
                value={review}
                onChange={(event) => setReview(event.target.value)}
              />
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                if (!rating) {
                  toast.error("Please select a star rating.");
                  return;
                }
                if (!review.trim()) {
                  toast.error("Please write a review.");
                  return;
                }
                setIsSubmitting(true);
                const ok = await onSubmit({ rating, review: review.trim() });
                setIsSubmitting(false);
                if (ok) setStep("success");
              }}
              className="mt-8 h-12 w-full rounded-full bg-[#D400B3] text-[18px] font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </>
        )}

        {step === "success" && (
          <div className="relative flex min-h-[80dvh] flex-col items-center justify-center px-2 text-center">
            <img
              src={confettiImage}
              alt=""
              className="pointer-events-none  absolute top-6 h-auto w-[92%] opacity-90"
            />
            <div className="z-50">
              {" "}
              <SuccessIcon />
            </div>

            <h3 className="mt-6 text-[24px] font-semibold text-[#1C1C1C]">
              Review Received
            </h3>
            <p className="mt-3 max-w-[620px] text-[14px] leading-[1.3] text-[#3D3D43]">
              Thanks for your feedback! We are always working to give you the
              best experience on Kinnect
            </p>
            <div className="mt-10 w-full space-y-4">
              <button
                type="button"
                onClick={onClose}
                className="h-12 w-full rounded-full bg-[#D400B3] text-[16px] font-semibold text-white"
              >
                Back To Settings
              </button>
              <button
                type="button"
                onClick={() => navigate("/app")}
                className="h-12 w-full rounded-full bg-[#55288D] text-[16px] font-semibold text-white"
              >
                Go To Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NeedHelpModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const SUPPORT_EMAIL = "support@kinnect.app";
  const HELP_ITEMS = [
    {
      title: "Login/Account Issues",
      body: [
        "Having trouble logging in? Try resetting your password or contact our support team for assistance.",
        "Account locked? Please verify your email address or contact support for help.",
      ],
    },
    {
      title: "Matchmaking Concerns",
      body: [
        "Not getting matches? Try adjusting your deal breakers or contact our team for personalized advice.",
        "Concerns about your matches? Our team is here to help you find a better connection.",
      ],
    },
    {
      title: "Profile Setup",
      body: [
        "Need help completing your profile? Check out our tips and guidelines for creating a great profile.",
        "Profile not updating? Try restarting the app or contact our support for assistance.",
      ],
    },
    {
      title: "Payment/Subscription Issues",
      body: [
        "Having trouble with payments? Contact our support team for assistance with subscription or billing issues.",
        "Subscription not activated? Please check your email for confirmation or contact support.",
      ],
    },
    {
      title: "Technical Issues",
      body: [
        "App not loading? Try restarting your device or contact our team for technical support.",
        "Error message? Please share a screenshot with our support team for assistance.",
      ],
    },
    {
      title: "Safety and Reporting",
      body: [
        "Concerns about a user? Please report them to our support team for review and assistance.",
        "Feeling unsafe? Our team is here to help. Please reach out for support and guidance.",
      ],
    },
  ];

  const [openItems, setOpenItems] = React.useState<Record<number, boolean>>({
    0: true,
  });

  React.useEffect(() => {
    if (!open) {
      setOpenItems({ 0: true });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 h-[90dvh] rounded-t-[18px] bg-[#F5F5F7] p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
          >
            <ChevronLeft size={16} className="text-[#1C1C1C]" />
          </button>
          <h2 className="text-[18px] font-semibold text-[#55288D]">
            Need Help with App
          </h2>
          <div className="w-9" />
        </div>

        <div className="max-h-[80dvh] overflow-y-auto ">
          <div className="space-y-3 px-2">
            {HELP_ITEMS.map((item, index) => {
              const isOpen = Boolean(openItems[index]);
              return (
                <div
                  key={item.title}
                  className="rounded-[6px] border border-[#DCCEEB] bg-[#FAF8FB]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenItems((prev) => ({
                        ...prev,
                        [index]: !prev[index],
                      }))
                    }
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-[14px] font-semibold text-[#1C1C1C]">
                      {item.title}
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#55288D] text-white">
                      {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="space-y-4 px-4 pb-4">
                      {item.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-[12px] leading-[1.45] text-[#6E6A75]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-10 text-center">
            <h3 className="text-[16px] font-semibold text-[#1C1C1C]">
              Need help with something else?
            </h3>
            <p className="mx-auto mt-2 max-w-[640px] text-[14px] text-[#6E6A75]">
              Our support team is here to assist you.
              <br />
              Please contact us.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mx-auto mt-6 flex h-10 mb-8 w-[130px] items-center justify-center rounded-full bg-[#D400B3] px-4 text-[12px] font-semibold text-white"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteAccountModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
  onDone: () => Promise<void>;
}> = ({ open, onClose, onDelete, onDone }) => {
  const navigate = useNavigate();
  const reasonOptions = [
    "Found/In a relationship",
    "Billing Issue",
    "Dissatisfied with service",
    "Others",
  ] as const;

  const [selectedReason, setSelectedReason] = React.useState<
    (typeof reasonOptions)[number] | null
  >(null);
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [step, setStep] = React.useState<"reasons" | "success">("reasons");

  React.useEffect(() => {
    if (!open) {
      setSelectedReason(null);
      setNote("");
      setIsSubmitting(false);
      setStep("reasons");
    }
  }, [open]);

  if (!open) return null;

  const requiresNote =
    selectedReason === "Dissatisfied with service" ||
    selectedReason === "Others";

  return (
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 min-h-[70dvh] rounded-t-[18px] bg-[#fff] p-4">
        {step === "reasons" && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
              >
                <ChevronLeft size={16} className="text-[#1C1C1C]" />
              </button>
              <h2 className="text-[18px] font-semibold text-[#55288D]">
                Delete My Account
              </h2>
              <div className="w-9" />
            </div>

            <p className="mb-6 text-[14px] leading-[1.45] text-[#1C1C1C]">
              Sorry to see you go! Please select a reason for deleting your
              profile/account:
            </p>

            <div className="space-y-3">
              {reasonOptions.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className="flex h-12 w-full items-center justify-between rounded-[6px] border border-[#DCCEEB] bg-[#FAF8FB] px-4 text-left text-[16px] font-medium text-[#1C1C1C]"
                >
                  {reason}
                  <ChevronRight size={16} className="text-[#1C1C1C]" />
                </button>
              ))}
            </div>

            {selectedReason && (
              <div className="absolute inset-0 z-10 rounded-t-[18px] bg-black/35">
                <div className="absolute min-h-[500px] inset-x-0  bottom-0 rounded-t-[22px] bg-[#F5F5F7] p-4">
                  <div className="mb-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReason(null);
                        setNote("");
                      }}
                    >
                      <X size={20} className="text-[#1C1C1C]" />
                    </button>
                  </div>

                  <div className="mb-4 mt-6 flex justify-center">
                    <Logo />
                  </div>
                  <h3 className="text-center text-[20px] font-semibold text-[#1C1C1C]">
                    {selectedReason === "Others"
                      ? "Others (Please Specify)"
                      : selectedReason}
                  </h3>

                  <p className="mx-auto mt-2 max-w-[680px] text-center text-[12px] leading-[1.45] text-[#3D3D43]">
                    {selectedReason === "Found/In a relationship" &&
                      "Congratulations on finding someone special! We're glad Kinnect could play a part. Your profile/account will be deleted. Good luck in your new relationship!"}
                    {selectedReason === "Billing Issue" &&
                      "Sorry to hear you're experiencing billing issues. Our support team will assist you. Please contact us at support email so we can resolve this for you."}
                    {selectedReason === "Dissatisfied with service" &&
                      "Sorry Kinnect didn't meet your expectations. We'd love to hear more about your experience. Your feedback will help us improve. Your profile/account will be deleted."}
                    {selectedReason === "Others" &&
                      "Thank you. We'll take your feedback into consideration. Your profile/account will be deleted."}
                  </p>

                  {requiresNote && (
                    <textarea
                      className="mt-4 h-[160px] w-full rounded-[8px] border border-[#DCCEEB] bg-[#FAF8FB] p-4 text-[14px] outline-none"
                      placeholder="Write here"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      if (requiresNote && !note.trim()) {
                        toast.error("Please provide your feedback.");
                        return;
                      }
                      setIsSubmitting(true);
                      const ok = await onDelete();
                      setIsSubmitting(false);
                      if (ok) {
                        setSelectedReason(null);
                        setStep("success");
                      }
                    }}
                    className="mt-10 h-12 w-full rounded-full bg-[#D400B3] text-[16px] font-semibold text-white disabled:opacity-60"
                  >
                    {isSubmitting ? "Deleting..." : "Delete My Account"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {step === "success" && (
          <div className="relative flex min-h-[80dvh] flex-col items-center justify-center px-2 text-center">
            <img
              src={confettiImage}
              alt=""
              className="pointer-events-none absolute top-6 h-auto w-[92%] opacity-90"
            />
            <div className="z-10">
              <SuccessIcon />
            </div>
            <h3 className="mt-6 text-[24px] font-semibold text-[#1C1C1C]">
              Account Deleted
            </h3>
            <p className="mt-3 max-w-[620px] text-[14px] leading-[1.35] text-[#3D3D43]">
              Your profile/account has been deleted. Thank you for using
              Kinnect!
            </p>
            <button
              type="button"
              onClick={async () => {
                await onDone();
                navigate("/auth/login", { replace: true });
              }}
              className="mt-8 h-12 w-full rounded-full bg-[#D400B3] text-[16px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { useAddRatingMutation, useDeleteAccountMutation } = useAuth();
  const { mutateAsync: addRating } = useAddRatingMutation();
  const { mutateAsync: deleteAccount } = useDeleteAccountMutation();
  const [isRatingModalOpen, setIsRatingModalOpen] = React.useState(false);
  const [isNeedHelpModalOpen, setIsNeedHelpModalOpen] = React.useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    React.useState(false);

  const displayName =
    `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() ||
    user?.username ||
    "Kinnect User";
  const displayEmail = user?.email || "no-email@kinnect.app";
  const profilePhoto =
    (Array.isArray(user?.profilePhotos) ? user?.profilePhotos[0] : null) ||
    UserImage;

  const menuItems = [
    {
      icon: ProfiileIcon,
      label: "My Profile",
      onClick: () => navigate("/app/my-profile"),
    },
    {
      icon: SubscriptionIcon,
      label: "Subscriptions",
      onClick: () => navigate("/app/subscriptions"),
    },
    {
      icon: BookCoachingIcon,
      label: "Book A Coaching Session",
      onClick: () => navigate("/onboarding/booksession"),
    },
    { icon: NotificationIcon, label: "Notifications" },
    {
      icon: PasswordIcon,
      label: "Change Password",
      onClick: () => navigate("/app/my-profile?modal=changePassword"),
    },
    {
      icon: RatingIcon,
      label: "Rating & Review",
      onClick: () => setIsRatingModalOpen(true),
    },
    {
      icon: FaqIcon,
      label: "Frequently Asked Questions (FAQs)",
      onClick: () => navigate("/app/faqs"),
    },
    {
      icon: HelpIcon,
      label: "Need Help with App",
      onClick: () => setIsNeedHelpModalOpen(true),
    },
    {
      icon: TermsIcon,
      label: "Terms & Conditions",
      onClick: () => navigate("/app/terms"),
    },
    {
      icon: PrivacyIcon,
      label: "Privacy Policy",
      onClick: () => navigate("/app/privacy-policy"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF] pb-24">
      <div className="h-[92px] bg-gradient-to-r from-[#450f77] via-[#65195c70] to-[#7e016b]" />

      <div className="px-4 -mt-12">
        <div className="mx-auto h-[88px] w-[88px] rounded-full border-2 border-[#D400B3] bg-white p-[2px]">
          <img
            src={profilePhoto}
            alt="Profile"
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        <div className="mt-3 text-center">
          <h1 className="text-[20px] !capitalize font-semibold text-[#1C1C1C]">
            {displayName}
          </h1>
          <p className="text-[14px] text-[#7B7B88]">{displayEmail}</p>
          <button
            type="button"
            className="mt-2 text-[12px] font-medium text-[#D400B3] underline"
            onClick={() => navigate("/app/my-profile")}
          >
            Review Profile
          </button>
        </div>

        <div className="mt-5 rounded-[10px] bg-[#21003F]  text-white">
          <div className="flex p-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <img src={ProfileIconImg} className="w-8 h-8" alt="" />
              <div className="">
                <p className="text-[12px] font-medium text-[#D7CBE6]">
                Profile Strength
              </p>
              <p className="text-[18px] font-semibold leading-none">
                60% Completed
              </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#D7CBE6]" />
          </div>
          <p className="mt-3 p-4 border-t border-dashed border-[#ffffff3d] text-[12px] text-[#D7CBE6]">
            Complete your profile now to get more matches
          </p>
        </div>

        <div className="mt-4 rounded-[10px] bg-[#FAF8FB] px-4 py-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <item.icon />
                <span className="text-[14px] font-medium text-[#6B7280]">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={16} className="text-[#6B7280]" />
            </button>
          ))}

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/auth/login", { replace: true });
            }}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <LogoutIcon />
              <span className="text-[16px] text-[#D92D20]">Logout</span>
            </div>
            <ChevronRight size={16} className="text-[#88889A]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteAccountModalOpen(true)}
          className="mt-4 flex w-full items-center justify-between rounded-[10px] border border-[#E3E3EA] bg-white px-4 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <DeleteIcon />
            <span className="text-[16px] text-[#1C1C1C]">
              Delete My Account
            </span>
          </div>
          <ChevronRight size={16} className="text-[#88889A]" />
        </button>
      </div>
      <RatingReviewModal
        open={isRatingModalOpen}
        initialRating={
          typeof user?.appRating === "number"
            ? user.appRating
            : Number(user?.appRating || 0)
        }
        initialReview={
          typeof user?.appReview === "string" ? user.appReview : ""
        }
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={async (payload) => {
          try {
            const response = await addRating(payload);
            toast.success(
              response?.message || "Review submitted successfully.",
            );
            return true;
          } catch (error) {
            toast.error(handleApiError(error));
            return false;
          }
        }}
      />
      <NeedHelpModal
        open={isNeedHelpModalOpen}
        onClose={() => setIsNeedHelpModalOpen(false)}
      />
      <DeleteAccountModal
        open={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onDelete={async () => {
          try {
            const response = await deleteAccount();
            toast.success(response?.message || "Account deleted successfully.");
            return true;
          } catch (error) {
            toast.error(handleApiError(error));
            return false;
          }
        }}
        onDone={async () => {
          await logout();
        }}
      />
    </div>
  );
};

export default ProfilePage;
