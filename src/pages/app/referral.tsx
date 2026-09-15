import React from "react";
import { ChevronLeft, Copy, Share2, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { referralService, type ReferralSummary } from "@/services/referral.service";

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

const joined = (value: string) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(date)
    : "—";
};

const ReferralPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<ReferralSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const referralLink = summary?.referralCode
    ? `${window.location.origin}/auth/register?ref=${encodeURIComponent(summary.referralCode)}`
    : "";

  const shareReferralLink = async () => {
    if (!referralLink) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join me on Kinnect",
          text: "Create your Kinnect account with my referral code.",
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
        toast.success("Referral link copied");
      }
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") {
        toast.error("Unable to share the referral link.");
      }
    }
  };

  React.useEffect(() => {
    referralService.getSummary()
      .then(setSummary)
      .catch((error) => toast.error(handleApiError(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[100dvh] bg-white pb-10">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#EFE8F4] bg-white px-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1ECF5]" aria-label="Go back">
          <ChevronLeft size={19} />
        </button>
        <h1 className="text-[18px] font-semibold text-[#55288D]">Referral</h1>
        <button type="button" onClick={() => navigate("/app/referral/earnings")} className="flex items-center gap-1.5 rounded-full bg-[#FFF3FC] px-3 py-2 text-[#A6008D]" aria-label="View referral earnings">
          <Wallet size={18} />
          <span className="text-[13px] font-semibold">{money(summary?.totalEarned ?? 0)}</span>
        </button>
      </header>

      <div className="px-4 pt-6">
       
        {summary?.referralCode && (
          <section className="rounded-[14px] bg-[#21003F] p-5 text-white">
         <div className="flex items-center mb-5 gap-4 justify-between">
             <p className="text-[12px] text-[#D7CBE6]">Your referral code</p>
             {summary?.pendingWithdrawal && (
          <div className=" inline-flex rounded-full  bg-[#c3b9cc] px-3 py-1.5 text-[12px] font-semibold text-[#21003F]">
            Pending withdrawal
          </div>
        )}
         </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <strong className="truncate text-[20px] tracking-[0.08em]">{summary.referralCode}</strong>
              <button type="button" onClick={() => navigator.clipboard.writeText(summary.referralCode!).then(() => toast.success("Referral code copied"))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15" aria-label="Copy referral code">
                <Copy size={18} />
              </button>
            </div>
            <p className="mt-3 text-[12px] leading-5 text-[#D7CBE6]">Share this code with friends. They can enter it when creating their account.</p>
            <div className="mt-5 border-t border-white/15 pt-4">
              <p className="text-[11px] font-medium  tracking-[0.08em] text-[#BFAFCF]">Referral link</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(referralLink).then(() => toast.success("Referral link copied"))}
                  className="min-w-0 flex-1 truncate rounded-[8px] bg-white/10 px-3 py-2.5 text-left text-[12px] text-[#F6EFFA]"
                  title="Copy referral link"
                >
                  {referralLink}
                </button>
                <button type="button" onClick={shareReferralLink} className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#D400B3] px-4 text-[13px] font-semibold text-white">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="mb-4 mt-7 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1C1C1C]">People you referred</h2>
            <p className="mt-1 text-[12px] text-[#837C89]">{summary?.totalReferrals ?? 0} total referrals</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EAF8] text-[#55288D]"><Users size={19} /></div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-[76px] animate-pulse rounded-[12px] bg-[#F5F2F7]" />)}</div>
        ) : summary?.referrals.length ? (
          <div className="space-y-3">
            {summary.referrals.map((person) => (
              <article key={person.id} className="rounded-[12px] border border-[#EADFF1] bg-[#FAF8FB] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold text-[#242127]">@{person.username}</h3>
                    <p className="mt-1 truncate text-[12px] text-[#77707F]">{person.email}</p>
                  </div>
                  <div className="shrink-0 text-right"><p className="text-[10px] uppercase tracking-wide text-[#9B93A1]">Joined</p><p className="mt-1 text-[12px] font-medium text-[#55288D]">{joined(person.createdAt)}</p></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#DCCEEB] px-6 py-12 text-center">
            <Users className="mx-auto text-[#BFA8CF]" size={34} />
            <h3 className="mt-4 text-[15px] font-semibold text-[#29252D]">No referrals yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-[#817986]">Share your referral code and the people who join with it will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ReferralPage;
