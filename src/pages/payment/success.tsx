import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { http } from "@/api/http";
import { endpoints } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth.store";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference) {
      navigate("/app", { replace: true });
      return;
    }

    http
      .get(`${endpoints.payments.verify}/${reference}`)
      .then(async () => {
        try {
          const profileRes = await http.get(endpoints.users.profile);
          const body = profileRes.data as any;
          const updatedUser = body?.data || body?.resp || body;
          if (updatedUser?.id) {
            await setUser(updatedUser);
          }
        } catch {
          // Non-critical — user refresh failed, subscription still activated
        }
        setStatus("success");
      })
      .catch(() => setStatus("failed"));
  }, [reference, navigate, setUser]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#55288D] animate-spin" />
        <p className="mt-4 text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
            <p className="text-gray-500">
              We could not verify your payment. Please contact support if you were charged.
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <Button
              className="w-full bg-[#55288D] text-white hover:bg-[#3d1a6b] rounded-full h-12"
              onClick={() => navigate("/app/subscriptions")}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full h-12"
              onClick={() => navigate("/app")}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-500">
            Your subscription is now active. Enjoy your plan!
          </p>
        </div>
        <div className="pt-4">
          <Button
            className="w-full bg-[#1A1A1A] text-white hover:bg-black rounded-full h-12"
            onClick={() => navigate("/app")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
