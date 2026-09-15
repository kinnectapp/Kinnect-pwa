import { http } from "@/api/http";
import { endpoints } from "@/api/endpoints";

export type ReferredUser = {
  id: string | number;
  username: string;
  email: string;
  createdAt: string;
};

export type ReferralSummary = {
  totalEarned: number;
  totalReferrals: number;
  referralCode?: string;
  pendingWithdrawal: boolean;
  referrals: ReferredUser[];
};

export type Bank = { name: string; code: string };

// Temporary preview mode. Set this to false when the referral backend is ready.
export const REFERRAL_MOCK_MODE = true;
const MOCK_PENDING_KEY = "kinnect_mock_referral_withdrawal_pending";
const wait = (milliseconds = 450) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const mockSummary: ReferralSummary = {
  totalEarned: 48500,
  totalReferrals: 8,
  referralCode: "KIN-AMARA24",
  pendingWithdrawal: false,
  referrals: [
    { id: 1, username: "dami_xo", email: "dami@example.com", createdAt: "2026-09-12T09:20:00Z" },
    { id: 2, username: "chidi.connects", email: "chidi@example.com", createdAt: "2026-09-08T14:05:00Z" },
    { id: 3, username: "the_real_zainab", email: "zainab@example.com", createdAt: "2026-08-29T11:45:00Z" },
    { id: 4, username: "tobi.a", email: "tobi@example.com", createdAt: "2026-08-17T16:30:00Z" },
    { id: 5, username: "nneka_n", email: "nneka@example.com", createdAt: "2026-08-04T08:15:00Z" },
    { id: 6, username: "ayo92", email: "ayo@example.com", createdAt: "2026-07-28T13:10:00Z" },
    { id: 7, username: "ife.love", email: "ife@example.com", createdAt: "2026-07-19T10:00:00Z" },
    { id: 8, username: "michael_o", email: "michael@example.com", createdAt: "2026-07-03T18:22:00Z" },
  ],
};

const mockBanks: Bank[] = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Kuda Bank", code: "50211" },
  { name: "OPay", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Sterling Bank", code: "232" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

const body = <T>(response: { data?: unknown }): T => {
  const outer = response.data as { data?: T } | T;
  return ((outer as { data?: T })?.data ?? outer) as T;
};

export const referralService = {
  getSummary: async (): Promise<ReferralSummary> => {
    if (REFERRAL_MOCK_MODE) {
      await wait();
      return {
        ...mockSummary,
        pendingWithdrawal:
          localStorage.getItem(MOCK_PENDING_KEY) === "true",
      };
    }
    const response = await http.get(endpoints.referral.dashboard);
    const data = body<Record<string, unknown>>(response);
    const rawReferrals = (data.referrals ?? data.users ?? []) as Array<Record<string, unknown>>;
    return {
      totalEarned: Number(data.totalEarned ?? data.total_earned ?? data.earnings ?? 0),
      totalReferrals: Number(data.totalReferrals ?? data.total_referrals ?? rawReferrals.length),
      referralCode: String(data.referralCode ?? data.referral_code ?? "") || undefined,
      pendingWithdrawal: Boolean(data.pendingWithdrawal ?? data.pending_withdrawal),
      referrals: rawReferrals.map((item, index) => ({
        id: (item.id as string | number) ?? index,
        username: String(item.username ?? "Kinnect user"),
        email: String(item.email ?? ""),
        createdAt: String(item.createdAt ?? item.created_at ?? item.dateJoined ?? ""),
      })),
    };
  },
  getBanks: async (): Promise<Bank[]> => {
    if (REFERRAL_MOCK_MODE) {
      await wait(300);
      return mockBanks;
    }
    const response = await http.get(endpoints.referral.banks);
    const data = body<Bank[] | { banks?: Bank[] }>(response);
    return Array.isArray(data) ? data : data.banks ?? [];
  },
  resolveAccount: async (accountNumber: string, bankCode: string): Promise<string> => {
    if (REFERRAL_MOCK_MODE) {
      await wait(700);
      return accountNumber.length === 10 && bankCode ? "AMARA OKAFOR" : "";
    }
    const response = await http.get(endpoints.referral.resolveAccount, {
      params: { account_number: accountNumber, bank_code: bankCode },
    });
    const data = body<Record<string, unknown>>(response);
    return String(data.account_name ?? data.accountName ?? "");
  },
  withdraw: async (payload: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    amount: number;
    password: string;
  }) => {
    if (REFERRAL_MOCK_MODE) {
      await wait(800);
      localStorage.setItem(MOCK_PENDING_KEY, "true");
      return { data: { status: true, data: { status: "pending" } } };
    }
    return http.post(endpoints.referral.withdraw, payload);
  },
};
