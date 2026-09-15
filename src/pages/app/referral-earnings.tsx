import React from "react";
import { ChevronLeft, Coins, Eye, EyeOff, WalletCards, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { referralService, type Bank, type ReferralSummary } from "@/services/referral.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

const ReferralEarningsPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<ReferralSummary | null>(null);
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [step, setStep] = React.useState<"details" | "password">("details");
  const [bankCode, setBankCode] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [resolving, setResolving] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setSummary(await referralService.getSummary()); }
    catch (error) { toast.error(handleApiError(error)); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  React.useEffect(() => {
    if (!modalOpen || banks.length) return;
    referralService.getBanks().then(setBanks).catch((error) => toast.error(handleApiError(error)));
  }, [modalOpen, banks.length]);

  React.useEffect(() => {
    setAccountName("");
    if (!bankCode || accountNumber.length !== 10) return;
    const timer = window.setTimeout(async () => {
      setResolving(true);
      try {
        const name = await referralService.resolveAccount(accountNumber, bankCode);
        if (!name) throw new Error("We could not verify this account.");
        setAccountName(name);
      } catch (error) { toast.error(handleApiError(error)); }
      finally { setResolving(false); }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [accountNumber, bankCode]);

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false); setStep("details"); setPassword("");
  };

  const selectedBank = banks.find((bank) => bank.code === bankCode);
  const numericAmount = Number(amount);
  const validDetails = Boolean(accountName && selectedBank && numericAmount > 0 && numericAmount <= (summary?.totalEarned ?? 0));

  const submit = async () => {
    if (!password) { toast.error("Enter your password to continue."); return; }
    setSubmitting(true);
    try {
      await referralService.withdraw({ accountNumber, bankCode, bankName: selectedBank!.name, amount: numericAmount, password });
      toast.success("Withdrawal request submitted");
      closeModal();
      setSummary((current) => current ? { ...current, pendingWithdrawal: true } : current);
      await load();
      navigate("/app/referral", { replace: true });
    } catch (error) { toast.error(handleApiError(error)); }
    finally { setSubmitting(false); }
  };

  return (
    <main className="min-h-[100dvh] bg-[#FBFAFC] pb-10">
      <header className="flex h-16 items-center justify-between border-b border-[#EFE8F4] bg-white px-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1ECF5]" aria-label="Go back"><ChevronLeft size={19} /></button>
        <h1 className="text-[18px] font-semibold text-[#55288D]">Referral Earnings</h1><div className="w-9" />
      </header>
      <div className="px-4 pt-6">
        <section className="overflow-hidden rounded-[18px] bg-gradient-to-br from-[#21003F] to-[#6B1760] p-6 text-white shadow-lg shadow-purple-950/10">
          <div className="flex items-start justify-between"><div><p className="text-[13px] text-[#DCCFE7]">Total earned</p><p className="mt-2 text-[30px] font-semibold">{money(summary?.totalEarned ?? 0)}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"><Coins size={25} /></div></div>
        </section>
        <section className="mt-5 rounded-[14px] border border-[#E9DFF0] bg-white p-5">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4EAF8] text-[#55288D]"><WalletCards size={21} /></div><div><p className="text-[12px] text-[#807787]">Total referrals</p><p className="text-[22px] font-semibold text-[#242127]">{summary?.totalReferrals ?? 0}</p></div></div>
        </section>
        {summary?.pendingWithdrawal && <div className="mt-5 rounded-[10px] border border-[#F1D28D] bg-[#FFF8E8] px-4 py-3 text-[13px] font-medium text-[#8A5D00]">Pending withdrawal</div>}
        <button type="button" disabled={!summary?.totalEarned || summary?.pendingWithdrawal} onClick={() => setModalOpen(true)} className="mt-8 h-12 w-full rounded-full bg-[#D400B3] text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#D9CFDB]">{summary?.pendingWithdrawal ? "Withdrawal pending" : "Withdraw"}</button>
      </div>

      {modalOpen && <div className="fixed inset-0 z-50"><button className="absolute inset-0 h-full w-full bg-black/40" onClick={closeModal} aria-label="Close modal" /><section className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[22px] bg-white p-5">
        <div className="flex items-center justify-between"><div className="w-8" /><h2 className="text-[18px] font-semibold text-[#55288D]">{step === "details" ? "Withdraw Earnings" : "Confirm Withdrawal"}</h2><button type="button" onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1ECF5]"><X size={17} /></button></div>
        {step === "details" ? <div className="mt-7 space-y-5">
          <div className="space-y-2"><Label>Bank name</Label><Select value={bankCode} onValueChange={setBankCode}><SelectTrigger className="h-12 border-[#DED3E6] bg-[#FAF8FB]"><SelectValue placeholder="Select your bank" /></SelectTrigger><SelectContent className="max-h-72">{banks.map((bank) => <SelectItem key={bank.code} value={bank.code}>{bank.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Account number</Label><Input inputMode="numeric" maxLength={10} placeholder="10-digit account number" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))} className="h-12 border-[#DED3E6] bg-[#FAF8FB]" />{resolving && <p className="text-[12px] text-[#77707F]">Verifying account...</p>}{accountName && <div className="rounded-[8px] bg-[#F0FAF4] px-3 py-2 text-[13px] font-semibold text-[#217A43]">{accountName}</div>}</div>
          <div className="space-y-2"><Label>Amount</Label><Input type="number" min="1" max={summary?.totalEarned} placeholder="₦0" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-12 border-[#DED3E6] bg-[#FAF8FB]" />{numericAmount > (summary?.totalEarned ?? 0) && <p className="text-[12px] text-red-500">Amount cannot exceed your available earnings.</p>}</div>
          <button type="button" disabled={!validDetails} onClick={() => setStep("password")} className="h-12 w-full rounded-full bg-[#D400B3] text-[16px] font-semibold text-white disabled:bg-[#D9CFDB]">Submit</button>
        </div> : <div className="mt-7"><p className="text-center text-[13px] leading-5 text-[#706976]">Enter your password to authorize the withdrawal of <strong className="text-[#29252D]">{money(numericAmount)}</strong>.</p><div className="mt-6 space-y-2"><Label>Password</Label><div className="relative"><Input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 border-[#DED3E6] bg-[#FAF8FB] pr-11" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 text-[#8D8294]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div><button type="button" disabled={!password || submitting} onClick={submit} className="mt-7 h-12 w-full rounded-full bg-[#D400B3] text-[16px] font-semibold text-white disabled:bg-[#D9CFDB]">{submitting ? "Submitting..." : "Continue"}</button></div>}
      </section></div>}
    </main>
  );
};

export default ReferralEarningsPage;
