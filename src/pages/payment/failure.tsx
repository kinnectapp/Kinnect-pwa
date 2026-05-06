import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentFailurePage = () => {
  const navigate = useNavigate();

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
            We couldn't process your payment. Please try again or use a different payment method.
          </p>
        </div>

        <div className="pt-4">
          <Button 
            className="w-full bg-[#1A1A1A] text-white hover:bg-black rounded-full h-12"
            onClick={() => navigate("/app")}
          >
            Go back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
