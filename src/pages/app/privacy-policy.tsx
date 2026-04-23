import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/layout/logo";

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#F5F5F7]  pb-[calc(env(safe-area-inset-bottom)+40px)]">
      <div className="bg-white  pt-[calc(env(safe-area-inset-top)+20px)]  px-4 pb-4">
        <div className=" flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE8F1]"
          >
            <ChevronLeft size={18} className="text-[#5A2B8D]" />
          </button>

          <Logo />

          <div className="w-9" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#450f77] via-[#65195c70] to-[#7e016b] px-6 py-7 text-center">
        <h1 className="text-[28px] font-semibold leading-[1.1] text-white">
          Privacy Policy
        </h1>
      </div>

      <div className="space-y-6 px-4 pt-6 text-[16px] leading-[1.5] text-[#1C1C1C]">
        <p>
          We collect personally identifiable information (PII) and non-PII. PII
          includes login details, profile information, and payment details.
          Non-PII includes aggregate information.
        </p>

        <p>
          We share information with users, service providers, partners, and
          legal authorities when required by law or with user consent. Personal
          information is retained for continued service and legal compliance
          purposes. We employ security measures, including SSL and encryption,
          but users acknowledge the inherent risks of internet data
          transmission. While all information provided will be held in the
          strictest confidence, demographic data may be used for research
          purposes. By accepting the terms and conditions of the Kinnect
          application, users therefore consent to the collection and use of
          information provided.
        </p>

        <p>
          We use cookies for various purposes, including improving services.
          Users can disable cookies but may experience reduced website
          functionality. By using Kinnect, users consent to the use of cookies.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
